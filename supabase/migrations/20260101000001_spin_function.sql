-- ==============================================================================
-- PATHIXO EXPO PLATFORM: SPIN WHEEL TRANSACTION FUNCTION
-- Migration: 20260101000001_spin_function.sql
-- Description: Cryptographically secure, atomic lucky draw function with inventory guards
-- ==============================================================================

-- Helper function to generate an unambiguous voucher code like PX-XXXX-XXXX
CREATE OR REPLACE FUNCTION public.generate_reward_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; -- 32 characters, no 0/O/1/I/L
  result TEXT := 'PX-';
  r_bytes BYTEA;
  i INT;
  val INT;
BEGIN
  r_bytes := gen_random_bytes(8);
  FOR i IN 0..7 LOOP
    IF i = 4 THEN
      result := result || '-';
    END IF;
    val := get_byte(r_bytes, i) % 32;
    result := result || substr(chars, val + 1, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Main spin_wheel function
CREATE OR REPLACE FUNCTION public.spin_wheel(
  p_visitor_id UUID,
  p_idempotency_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_existing_spin RECORD;
  v_visitor_exists BOOLEAN;
  v_chosen_reward RECORD;
  v_total_weight BIGINT;
  v_random_point BIGINT;
  v_running_sum BIGINT := 0;
  v_code TEXT;
  v_spin_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_reward_cur CURSOR FOR
    SELECT id, slug, name, description, reward_type, remaining_inventory, probability_weight, expiry_days, redemption_instructions
    FROM public.rewards
    WHERE is_active = true AND (reward_type = 'no_prize' OR remaining_inventory > 0)
    ORDER BY id;
  v_retries INT := 0;
  v_decremented BOOLEAN := false;
  v_random_bytes BYTEA;
  v_rand_val BIGINT;
BEGIN
  -- 1. Idempotency Check: Did this visitor or idempotency key already produce a spin?
  SELECT 
    s.id AS spin_id,
    s.reward_id,
    s.reward_code,
    s.expires_at,
    s.redemption_status,
    s.created_at,
    r.slug AS reward_slug,
    r.name AS reward_name,
    r.description AS reward_description,
    r.reward_type,
    r.redemption_instructions
  INTO v_existing_spin
  FROM public.spins s
  JOIN public.rewards r ON r.id = s.reward_id
  WHERE s.visitor_id = p_visitor_id OR s.idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'ok', true,
      'already_spun', true,
      'spin_id', v_existing_spin.spin_id,
      'reward_id', v_existing_spin.reward_id,
      'reward_name', v_existing_spin.reward_name,
      'reward_slug', v_existing_spin.reward_slug,
      'reward_type', v_existing_spin.reward_type,
      'reward_description', v_existing_spin.reward_description,
      'reward_code', v_existing_spin.reward_code,
      'expires_at', v_existing_spin.expires_at,
      'redemption_status', v_existing_spin.redemption_status,
      'redemption_instructions', v_existing_spin.redemption_instructions
    );
  END IF;

  -- 2. Verify visitor exists
  SELECT EXISTS (SELECT 1 FROM public.visitors WHERE id = p_visitor_id) INTO v_visitor_exists;
  IF NOT v_visitor_exists THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'VISITOR_NOT_FOUND', 'message', 'Invalid visitor identification')
    );
  END IF;

  -- 3. Selection & Atomic Inventory Decrement Loop (Max 3 retries under concurrent lock contention)
  WHILE v_retries < 3 AND NOT v_decremented LOOP
    v_retries := v_retries + 1;
    v_total_weight := 0;

    -- Calculate total active probability weight
    SELECT COALESCE(SUM(probability_weight), 0)
    INTO v_total_weight
    FROM public.rewards
    WHERE is_active = true AND (reward_type = 'no_prize' OR remaining_inventory > 0);

    IF v_total_weight <= 0 THEN
      -- Fallback to any active no_prize reward
      SELECT id, slug, name, description, reward_type, remaining_inventory, probability_weight, expiry_days, redemption_instructions
      INTO v_chosen_reward
      FROM public.rewards
      WHERE reward_type = 'no_prize'
      LIMIT 1;
      
      IF NOT FOUND THEN
        RETURN jsonb_build_object(
          'ok', false,
          'error', jsonb_build_object('code', 'NO_REWARDS_AVAILABLE', 'message', 'Lucky draw is currently inactive')
        );
      END IF;
      v_decremented := true;
    ELSE
      -- Cryptographically secure random integer between 1 and v_total_weight
      v_random_bytes := gen_random_bytes(4);
      v_rand_val := (
        (get_byte(v_random_bytes, 0)::BIGINT << 24) |
        (get_byte(v_random_bytes, 1)::BIGINT << 16) |
        (get_byte(v_random_bytes, 2)::BIGINT << 8)  |
        (get_byte(v_random_bytes, 3)::BIGINT)
      ) & 2147483647; -- Positive 31-bit integer
      
      v_random_point := (v_rand_val % v_total_weight) + 1;
      v_running_sum := 0;
      v_chosen_reward := NULL;

      -- Iterate through rewards to find selected reward
      FOR r IN v_reward_cur LOOP
        v_running_sum := v_running_sum + r.probability_weight;
        IF v_running_sum >= v_random_point THEN
          v_chosen_reward := r;
          EXIT;
        END IF;
      END LOOP;

      -- If no prize was picked or reward is no_prize, no decrement needed
      IF v_chosen_reward IS NULL OR v_chosen_reward.reward_type = 'no_prize' THEN
        IF v_chosen_reward IS NULL THEN
          SELECT id, slug, name, description, reward_type, remaining_inventory, probability_weight, expiry_days, redemption_instructions
          INTO v_chosen_reward
          FROM public.rewards
          WHERE reward_type = 'no_prize'
          LIMIT 1;
        END IF;
        v_decremented := true;
      ELSE
        -- Atomically decrement inventory with guard
        UPDATE public.rewards
        SET remaining_inventory = remaining_inventory - 1
        WHERE id = v_chosen_reward.id AND remaining_inventory > 0;

        IF FOUND THEN
          v_decremented := true;
        END IF;
      END IF;
    END IF;
  END LOOP;

  IF NOT v_decremented THEN
    -- Final fallback to no_prize if race conditions prevented allocation
    SELECT id, slug, name, description, reward_type, remaining_inventory, probability_weight, expiry_days, redemption_instructions
    INTO v_chosen_reward
    FROM public.rewards
    WHERE reward_type = 'no_prize'
    LIMIT 1;
  END IF;

  -- 4. Generate Unique Code and Insert Spin Record
  LOOP
    v_code := public.generate_reward_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.spins WHERE reward_code = v_code);
  END LOOP;

  v_expires_at := now() + (COALESCE(v_chosen_reward.expiry_days, 30) || ' days')::INTERVAL;

  BEGIN
    INSERT INTO public.spins (
      visitor_id,
      reward_id,
      idempotency_key,
      reward_code,
      expires_at
    ) VALUES (
      p_visitor_id,
      v_chosen_reward.id,
      p_idempotency_key,
      v_code,
      v_expires_at
    )
    RETURNING id INTO v_spin_id;
  EXCEPTION WHEN unique_violation THEN
    -- Handle concurrent duplicate attempt: return existing spin
    SELECT 
      s.id AS spin_id,
      s.reward_id,
      s.reward_code,
      s.expires_at,
      s.redemption_status,
      r.slug AS reward_slug,
      r.name AS reward_name,
      r.description AS reward_description,
      r.reward_type,
      r.redemption_instructions
    INTO v_existing_spin
    FROM public.spins s
    JOIN public.rewards r ON r.id = s.reward_id
    WHERE s.visitor_id = p_visitor_id
    LIMIT 1;

    RETURN jsonb_build_object(
      'ok', true,
      'already_spun', true,
      'spin_id', v_existing_spin.spin_id,
      'reward_id', v_existing_spin.reward_id,
      'reward_name', v_existing_spin.reward_name,
      'reward_slug', v_existing_spin.reward_slug,
      'reward_type', v_existing_spin.reward_type,
      'reward_description', v_existing_spin.reward_description,
      'reward_code', v_existing_spin.reward_code,
      'expires_at', v_existing_spin.expires_at,
      'redemption_status', v_existing_spin.redemption_status,
      'redemption_instructions', v_existing_spin.redemption_instructions
    );
  END;

  RETURN jsonb_build_object(
    'ok', true,
    'already_spun', false,
    'spin_id', v_spin_id,
    'reward_id', v_chosen_reward.id,
    'reward_name', v_chosen_reward.name,
    'reward_slug', v_chosen_reward.slug,
    'reward_type', v_chosen_reward.reward_type,
    'reward_description', v_chosen_reward.description,
    'reward_code', v_code,
    'expires_at', v_expires_at,
    'redemption_status', 'not_redeemed',
    'redemption_instructions', v_chosen_reward.redemption_instructions
  );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;

-- Grant EXECUTE permission exclusively to service_role
REVOKE ALL ON FUNCTION public.spin_wheel(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spin_wheel(UUID, TEXT) TO service_role;
