-- ==============================================================================
-- PATHIXO EXPO PLATFORM: SEED DATA
-- Description: Initial product catalog and placeholder rewards
-- Note: Reward offers are placeholders and kept inactive until approved by Pathixo.
-- ==============================================================================

-- 1. Products Catalog (Proprietary Products & Custom Services)
INSERT INTO public.products (slug, name, tagline, description, key_features, destination_url, badge_text, launch_status, display_order, is_active)
VALUES
(
  'vakxo',
  'Vakxo',
  'Your Dev Environment Obeys Your Voice',
  'Pathixo''s flagship intelligent developer product engineered to automate coding workflows, terminal operations, and workspace productivity using voice and AI precision.',
  '["Voice-driven developer workflows", "Context-aware AI workspace", "Terminal & coding automation", "High-speed developer experience"]'::jsonb,
  'https://vakxo.pathixo.com/',
  'Live Product',
  'live',
  1,
  true
),
(
  'kroc-pdf',
  'krocPDF',
  'High-Performance PDF Processing & Intelligence',
  'Fast, reliable document intelligence utility designed for high-volume conversion, manipulation, and secure structured extraction from PDF documents.',
  '["Ultra-fast document conversion", "Secure client-side rendering", "OCR & structured extraction", "Zero document retention policy"]'::jsonb,
  'https://www.pathixo.com/products/kroc-pdf',
  'Enterprise Web App',
  'live',
  2,
  true
),
(
  'custom-engineering',
  'Custom Product Engineering',
  'From Vision to Production-Grade Scalable Software',
  'Full-lifecycle software engineering for businesses and founders. We design, architect, and build scalable web platforms, AI integrations, mobile apps, and enterprise backends.',
  '["Bespoke AI & Agentic Systems", "High-Scale Web & Mobile Applications", "Cloud Infrastructure & Microservices", "Security & Reliability Engineering"]'::jsonb,
  NULL,
  'Available for Projects',
  'live',
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  key_features = EXCLUDED.key_features,
  badge_text = EXCLUDED.badge_text,
  launch_status = EXCLUDED.launch_status,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 2. Rewards (Lucky Draw Prizes - Active Expo Pool)
INSERT INTO public.rewards (slug, name, display_label, description, reward_type, total_inventory, remaining_inventory, max_cap, claimed_count, probability_weight, is_active, expiry_days, redemption_instructions)
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
  'discount-20-vakxo',
  '20% Off Vakxo Pro Subscription',
  '20% Vakxo',
  '20% discount voucher applied to Vakxo Pro monthly or annual developer license.',
  'discount',
  0,
  0,
  NULL,
  0,
  15,
  true,
  60,
  'Apply this voucher code at checkout on vakxo.com or show it to our booth team.'
),
(
  'discount-50-krocpdf',
  '50% Off krocPDF Pro Access',
  '50% kroc',
  '50% discount on krocPDF Pro high-speed document intelligence and OCR suite.',
  'discount',
  0,
  0,
  NULL,
  0,
  10,
  true,
  45,
  'Use this voucher code at checkout inside krocPDF to claim your 50% discount.'
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
