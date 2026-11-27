-- ==============================================================================
-- PATHIXO EXPO PLATFORM: IMMEDIATE SUPABASE REWARD SYNC & FIX
-- Run this ENTIRE script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- This replaces the old placeholder rewards ("Special Exhibition Thank-You Voucher", etc.)
-- with the 8 official live expo prizes.
-- ==============================================================================

-- 1. Ensure required columns exist on rewards & spins tables
ALTER TABLE public.rewards
  ADD COLUMN IF NOT EXISTS max_cap INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS claimed_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS display_label TEXT;

ALTER TABLE public.spins
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS user_phone TEXT,
  ADD COLUMN IF NOT EXISTS user_email TEXT,
  ADD COLUMN IF NOT EXISTS prize_label TEXT,
  ADD COLUMN IF NOT EXISTS email_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_error TEXT,
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'unclaimed';

-- 2. Deactivate old placeholder rewards (including 'thank-you-pass', 'exclusive-merchandise', etc.)
UPDATE public.rewards
SET is_active = false
WHERE slug NOT IN (
  'vakxo-1-year',
  'vakxo-1-month',
  'discount-30-vakxo',
  'discount-20-dev',
  'discount-50-cloud',
  'krocpdf-6-month',
  'extended-trial-3mo',
  'vakxo-6-month'
);

-- 3. Upsert the 8 Official Wheel Rewards
INSERT INTO public.rewards (
  slug, name, display_label, description, reward_type, 
  total_inventory, remaining_inventory, max_cap, claimed_count, 
  probability_weight, is_active, expiry_days, redemption_instructions
)
VALUES
(
  'vakxo-1-year',
  '1-Year Vakxo Pro Subscription',
  '1-Yr Vakxo',
  'Full 12-month access to Vakxo AI developer environment with unlimited voice actions and terminal automation.',
  'credit',
  2,
  2,
  2,
  0,
  2,
  true,
  90,
  'Show this code at the booth or reply to your voucher confirmation email to activate your 1-Year Vakxo Pro license.'
),
(
  'vakxo-1-month',
  '1-Month Vakxo Pro Access',
  '1-Mo Vakxo',
  'Enjoy 30 days of Vakxo Pro AI workspace platform for your development team.',
  'credit',
  50,
  50,
  50,
  0,
  35,
  true,
  30,
  'Present this code at the Pathixo counter to receive your license key.'
),
(
  'discount-30-vakxo',
  '30% Off Vakxo Annual Plan',
  '30% Vakxo',
  '30% discount voucher applied to the Vakxo AI developer platform annual subscription.',
  'discount',
  0,
  0,
  NULL,
  0,
  15,
  true,
  30,
  'Apply this voucher code at checkout on vakxo.com or show it to our booth team.'
),
(
  'discount-20-dev',
  '20% Off Custom Engineering Milestone',
  '20% Dev',
  '20% credit applied to the first sprint of custom AI or software engineering with Pathixo.',
  'discount',
  0,
  0,
  NULL,
  0,
  15,
  true,
  60,
  'Mention this voucher code during your project kickoff call with Pathixo leadership.'
),
(
  'discount-50-cloud',
  '50% Off Cloud & DevOps Setup',
  '50% Cloud',
  '50% discount on initial cloud infrastructure, CI/CD pipeline automation, or Kubernetes setup.',
  'discount',
  0,
  0,
  NULL,
  0,
  10,
  true,
  45,
  'Show this code to our solutions architect to apply the 50% cloud discount.'
),
(
  'krocpdf-6-month',
  '6-Month krocPDF Pro Access',
  '6M krocPDF',
  '6 months of unlimited, high-speed in-browser PDF manipulation and document extraction with krocPDF Pro.',
  'credit',
  0,
  0,
  NULL,
  0,
  8,
  true,
  60,
  'Enter this voucher code inside krocPDF to unlock 6 months of Pro tier access.'
),
(
  'extended-trial-3mo',
  '3-Month krocPDF Team Pass',
  '3M krocPDF',
  'Unlimited fast in-browser document processing and structured extraction for your entire team.',
  'credit',
  0,
  0,
  NULL,
  0,
  15,
  true,
  60,
  'Use this pass code to activate team access on krocPDF.'
),
(
  'vakxo-6-month',
  '6-Month Vakxo Pro Subscription',
  '6-Mo Vakxo',
  '6-Month access to Vakxo AI developer environment with voice actions and terminal automation.',
  'credit',
  0,
  0,
  NULL,
  0,
  0,
  true,
  90,
  'Special promotional tier voucher code.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  display_label = EXCLUDED.display_label,
  description = EXCLUDED.description,
  reward_type = EXCLUDED.reward_type,
  total_inventory = EXCLUDED.total_inventory,
  remaining_inventory = EXCLUDED.remaining_inventory,
  max_cap = EXCLUDED.max_cap,
  probability_weight = EXCLUDED.probability_weight,
  is_active = EXCLUDED.is_active,
  expiry_days = EXCLUDED.expiry_days,
  redemption_instructions = EXCLUDED.redemption_instructions;

-- 4. Replace spin_wheel function with probability_weight > 0 protection
CREATE OR REPLACE FUNCTION public.spin_wheel(
  p_visitor_id UUID,
  p_idempotency_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_existing_spin RECORD;
  v_visitor RECORD;
  v_chosen_reward RECORD;
  v_total_weight BIGINT;
  v_random_point BIGINT;
  v_running_sum BIGINT := 0;
  v_code TEXT;
  v_spin_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_retries INT := 0;
  v_allocated BOOLEAN := false;
  v_random_bytes BYTEA;
  v_rand_val BIGINT;
  v_rec RECORD;
BEGIN
  -- 1. Idempotency Check: Did this visitor or idempotency key already produce a spin?
  SELECT 
    s.id AS spin_id,
    s.reward_id,
    s.reward_code,
    s.expires_at,
    s.redemption_status,
    s.fulfillment_status,
    s.email_status,
    s.created_at,
    r.slug AS reward_slug,
    r.name AS reward_name,
    COALESCE(r.display_label, r.name) AS display_label,
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
      'display_label', v_existing_spin.display_label,
      'reward_slug', v_existing_spin.reward_slug,
      'reward_type', v_existing_spin.reward_type,
      'reward_description', v_existing_spin.reward_description,
      'reward_code', v_existing_spin.reward_code,
      'expires_at', v_existing_spin.expires_at,
      'redemption_status', v_existing_spin.redemption_status,
      'fulfillment_status', v_existing_spin.fulfillment_status,
      'email_status', v_existing_spin.email_status,
      'redemption_instructions', v_existing_spin.redemption_instructions
    );
  END IF;

  -- 2. Verify visitor exists
  SELECT id, full_name, mobile, email
  INTO v_visitor
  FROM public.visitors
  WHERE id = p_visitor_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'VISITOR_NOT_FOUND', 'message', 'Invalid visitor identification')
    );
  END IF;

  -- 3. Calculate active weights and pick reward (excludes probability_weight = 0)
  WHILE v_retries < 5 AND NOT v_allocated LOOP
    v_retries := v_retries + 1;
    v_total_weight := 0;

    SELECT COALESCE(SUM(probability_weight), 0)
    INTO v_total_weight
    FROM public.rewards
    WHERE is_active = true 
      AND probability_weight > 0
      AND (max_cap IS NULL OR claimed_count < max_cap)
      AND (total_inventory = 0 OR remaining_inventory > 0);

    IF v_total_weight <= 0 THEN
      -- Fallback to active voucher
      SELECT id, slug, name, COALESCE(display_label, name) AS display_label, description, reward_type, expiry_days, redemption_instructions
      INTO v_chosen_reward
      FROM public.rewards
      WHERE is_active = true AND probability_weight > 0
      ORDER BY id
      LIMIT 1;
      v_allocated := true;
    ELSE
      v_random_bytes := extensions.gen_random_bytes(4);
      v_rand_val := (
        (get_byte(v_random_bytes, 0)::BIGINT << 24) |
        (get_byte(v_random_bytes, 1)::BIGINT << 16) |
        (get_byte(v_random_bytes, 2)::BIGINT << 8)  |
        (get_byte(v_random_bytes, 3)::BIGINT)
      ) & 2147483647;
      
      v_random_point := (v_rand_val % v_total_weight) + 1;
      v_running_sum := 0;
      v_chosen_reward := NULL;

      FOR v_rec IN 
        SELECT id, slug, name, display_label, description, reward_type, remaining_inventory, total_inventory, max_cap, claimed_count, probability_weight, expiry_days, redemption_instructions
        FROM public.rewards
        WHERE is_active = true 
          AND probability_weight > 0
          AND (max_cap IS NULL OR claimed_count < max_cap)
          AND (total_inventory = 0 OR remaining_inventory > 0)
        ORDER BY id
      LOOP
        v_running_sum := v_running_sum + v_rec.probability_weight;
        IF v_running_sum >= v_random_point THEN
          v_chosen_reward := v_rec;
          EXIT;
        END IF;
      END LOOP;

      IF v_chosen_reward IS NULL THEN
        SELECT id, slug, name, COALESCE(display_label, name) AS display_label, description, reward_type, expiry_days, redemption_instructions
        INTO v_chosen_reward
        FROM public.rewards
        WHERE is_active = true AND probability_weight > 0
        ORDER BY id
        LIMIT 1;
        v_allocated := true;
      ELSE
        IF v_chosen_reward.max_cap IS NOT NULL OR v_chosen_reward.total_inventory > 0 THEN
          UPDATE public.rewards
          SET 
            claimed_count = claimed_count + 1,
            remaining_inventory = CASE WHEN remaining_inventory > 0 THEN remaining_inventory - 1 ELSE 0 END
          WHERE id = v_chosen_reward.id
            AND (max_cap IS NULL OR claimed_count < max_cap)
            AND (total_inventory = 0 OR remaining_inventory > 0);

          IF FOUND THEN
            v_allocated := true;
          END IF;
        ELSE
          UPDATE public.rewards
          SET claimed_count = claimed_count + 1
          WHERE id = v_chosen_reward.id;
          v_allocated := true;
        END IF;
      END IF;
    END IF;
  END LOOP;

  IF NOT v_allocated OR v_chosen_reward IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'REWARD_ALLOCATION_FAILED', 'message', 'Unable to allocate reward. Please retry.')
    );
  END IF;

  -- 4. Generate unique voucher code
  v_code := 'PX-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 5, 4));
  v_expires_at := now() + (COALESCE(v_chosen_reward.expiry_days, 30) || ' days')::INTERVAL;
  v_spin_id := gen_random_uuid();

  -- 5. Record the spin
  INSERT INTO public.spins (
    id, visitor_id, reward_id, idempotency_key, reward_code,
    user_name, user_phone, user_email, prize_label,
    expires_at, redemption_status, fulfillment_status, email_status
  ) VALUES (
    v_spin_id, v_visitor.id, v_chosen_reward.id, p_idempotency_key, v_code,
    v_visitor.full_name, v_visitor.mobile, v_visitor.email, v_chosen_reward.name,
    v_expires_at, 'not_redeemed', 'unclaimed', 'pending'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'already_spun', false,
    'spin_id', v_spin_id,
    'reward_id', v_chosen_reward.id,
    'reward_name', v_chosen_reward.name,
    'display_label', COALESCE(v_chosen_reward.display_label, v_chosen_reward.name),
    'reward_slug', v_chosen_reward.slug,
    'reward_type', v_chosen_reward.reward_type,
    'reward_description', v_chosen_reward.description,
    'reward_code', v_code,
    'expires_at', v_expires_at,
    'redemption_status', 'not_redeemed',
    'fulfillment_status', 'unclaimed',
    'email_status', 'pending',
    'redemption_instructions', v_chosen_reward.redemption_instructions
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verification Query: View all active rewards in Supabase
SELECT id, slug, display_label, name, probability_weight, total_inventory, is_active
FROM public.rewards
WHERE is_active = true
ORDER BY id;
