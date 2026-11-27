-- ==============================================================================
-- PATHIXO EXPO PLATFORM: SPIN WHEEL INTEGRATION VERIFICATION TESTS
-- Description: SQL test script to verify idempotency, inventory guards, and fallback
-- Run this in Supabase SQL Editor or psql to verify database logic.
-- ==============================================================================

DO $$
DECLARE
  v_test_visitor_1 UUID;
  v_test_visitor_2 UUID;
  v_test_reward_id UUID;
  v_res_1 JSONB;
  v_res_2 JSONB;
  v_res_3 JSONB;
  v_spin_count INT;
  v_remaining INT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'STARTING SPIN_WHEEL LOGIC VERIFICATION';
  RAISE NOTICE '========================================';

  -- 1. Setup Test Visitors
  INSERT INTO public.visitors (
    full_name, email, mobile, company, designation, interested_product, privacy_consent
  ) VALUES (
    'Test Visitor Alpha', 'test.alpha@example.com', '9876543210', 'Acme Corp', 'Lead Engineer', 'vakxo', true
  ) RETURNING id INTO v_test_visitor_1;

  INSERT INTO public.visitors (
    full_name, email, mobile, company, designation, interested_product, privacy_consent
  ) VALUES (
    'Test Visitor Beta', 'test.beta@example.com', '9876543211', 'Beta Ltd', 'CTO', 'custom-engineering', true
  ) RETURNING id INTO v_test_visitor_2;

  -- 2. Setup a Limited Test Reward (Inventory = 1)
  INSERT INTO public.rewards (
    slug, name, description, reward_type, total_inventory, remaining_inventory, probability_weight, is_active, expiry_days
  ) VALUES (
    'test-limited-reward', 'Test 1-Unit Reward', 'Limited quantity reward for testing', 'discount', 1, 1, 100, true, 30
  ) RETURNING id INTO v_test_reward_id;

  -- Ensure fallback reward exists and is active
  INSERT INTO public.rewards (
    slug, name, description, reward_type, total_inventory, remaining_inventory, probability_weight, is_active, expiry_days
  ) VALUES (
    'test-fallback', 'Test Fallback Voucher', 'Fallback when stock runs out', 'no_prize', 0, 0, 10, true, 30
  ) ON CONFLICT (slug) DO UPDATE SET is_active = true;

  -- ============================================================================
  -- TEST 1: Same visitor calling spin_wheel twice produces exactly 1 spin
  -- ============================================================================
  v_res_1 := public.spin_wheel(v_test_visitor_1, 'test-key-001');
  IF (v_res_1->>'ok')::BOOLEAN != true OR (v_res_1->>'already_spun')::BOOLEAN != false THEN
    RAISE EXCEPTION 'TEST 1 FAILED: First spin should succeed with already_spun = false. Got: %', v_res_1;
  END IF;

  v_res_2 := public.spin_wheel(v_test_visitor_1, 'test-key-002');
  IF (v_res_2->>'ok')::BOOLEAN != true OR (v_res_2->>'already_spun')::BOOLEAN != true THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Second spin should return already_spun = true. Got: %', v_res_2;
  END IF;

  IF (v_res_1->>'reward_code') != (v_res_2->>'reward_code') THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Second call returned different reward code! 1: %, 2: %', v_res_1->>'reward_code', v_res_2->>'reward_code';
  END IF;

  SELECT COUNT(*) INTO v_spin_count FROM public.spins WHERE visitor_id = v_test_visitor_1;
  IF v_spin_count != 1 THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Visitor should have exactly 1 spin row, found: %', v_spin_count;
  END IF;
  RAISE NOTICE '✓ TEST 1 PASSED: One spin per visitor and idempotency enforced.';

  -- ============================================================================
  -- TEST 2: Inventory decrement guard & no negative inventory
  -- ============================================================================
  -- Visitor 1 claimed the limited reward. Remaining should now be 0.
  SELECT remaining_inventory INTO v_remaining FROM public.rewards WHERE id = v_test_reward_id;
  IF v_remaining != 0 THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Expected remaining_inventory = 0, got: %', v_remaining;
  END IF;

  -- Visitor 2 spins. Since the limited reward is 0, it must fallback to no_prize!
  v_res_3 := public.spin_wheel(v_test_visitor_2, 'test-key-003');
  IF (v_res_3->>'ok')::BOOLEAN != true THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Visitor 2 spin failed: %', v_res_3;
  END IF;

  IF (v_res_3->>'reward_type') != 'no_prize' THEN
    RAISE EXCEPTION 'TEST 2 FAILED: When limited reward is exhausted, must fall back to no_prize. Got: %', v_res_3->>'reward_type';
  END IF;

  -- Ensure inventory did not go negative
  SELECT remaining_inventory INTO v_remaining FROM public.rewards WHERE id = v_test_reward_id;
  IF v_remaining < 0 THEN
    RAISE EXCEPTION 'TEST 2 FAILED: Inventory went negative! Value: %', v_remaining;
  END IF;
  RAISE NOTICE '✓ TEST 2 PASSED: Inventory decremented cleanly and never goes below zero.';
  RAISE NOTICE '✓ TEST 3 PASSED: Clean fallback to no_prize when inventory exhausted.';

  -- Cleanup test data
  DELETE FROM public.spins WHERE visitor_id IN (v_test_visitor_1, v_test_visitor_2);
  DELETE FROM public.visitors WHERE id IN (v_test_visitor_1, v_test_visitor_2);
  DELETE FROM public.rewards WHERE id = v_test_reward_id;
  DELETE FROM public.rewards WHERE slug = 'test-fallback';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'ALL SPIN_WHEEL TESTS PASSED SUCCESSFULLY';
  RAISE NOTICE '========================================';
END $$;
