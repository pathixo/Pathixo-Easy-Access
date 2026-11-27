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
  'Intelligent AI-Powered Workspace & Productivity',
  'Pathixo''s proprietary AI product engineered to streamline modern digital workflows, enhance user collaboration, and automate routine operational tasks with high precision.',
  '["Context-aware AI workspace", "Automated operational workflows", "Intelligent data extraction", "Enterprise privacy standards"]'::jsonb,
  NULL,
  'Coming Soon',
  'coming_soon',
  1,
  true
),
(
  'crock-pdf',
  'Crock PDF',
  'High-Performance PDF Processing & Intelligence',
  'Fast, reliable document intelligence utility designed for high-volume conversion, manipulation, and secure structured extraction from PDF documents.',
  '["Ultra-fast document conversion", "Secure client-side rendering", "OCR & structured extraction", "Zero document retention policy"]'::jsonb,
  NULL,
  'Coming Soon',
  'coming_soon',
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

-- 2. Rewards (Lucky Draw Prizes)
-- IMPORTANT: All promotional reward offers are PLACEHOLDERS with is_active = false
-- until officially approved by Pathixo management.
-- The 'no_prize' fallback reward is active to guarantee clean fallback handling.

INSERT INTO public.rewards (slug, name, description, reward_type, total_inventory, remaining_inventory, probability_weight, is_active, expiry_days, redemption_instructions)
VALUES
(
  'thank-you-pass',
  'Special Exhibition Thank-You Voucher',
  'Thank you for visiting Pathixo at Expo Mart! Connect with our engineering leadership at the stall for priority scheduling on future consultations.',
  'no_prize',
  0,
  0,
  20,
  true, -- Fallback reward is active
  60,
  'Present this code at the Pathixo exhibition stall to connect directly with our founding engineering team.'
),
(
  'discount-15-custom-dev',
  '15% Off First Custom Development Milestone',
  'Receive a 15% discount on the first sprint or development milestone of your custom software or AI engineering project with Pathixo.',
  'discount',
  50,
  50,
  30,
  false, -- PLACEHOLDER: Pending Pathixo approval
  30,
  'Show this code to the Pathixo stall team or mention it during your project discovery kickoff call.'
),
(
  'free-ai-consultation',
  'Free 1-on-1 AI Architecture Consultation',
  'Complimentary 60-minute deep-dive consultation with Pathixo''s Principal AI Architect to review your product roadmap and tech stack.',
  'consultation',
  30,
  30,
  25,
  false, -- PLACEHOLDER: Pending Pathixo approval
  30,
  'Show this code to book your dedicated 60-minute session with Pathixo engineering leadership.'
),
(
  'credit-10k-cloud',
  '₹10,000 Cloud Architecture Credit',
  '₹10,000 credit applicable toward cloud infrastructure setup, deployment automation, or DevOps architecture on projects above ₹1,00,000.',
  'credit',
  15,
  15,
  15,
  false, -- PLACEHOLDER: Pending Pathixo approval
  45,
  'Present this code to apply the ₹10,000 credit on your engineering proposal.'
),
(
  'exclusive-merchandise',
  'Exclusive Pathixo Tech Merchandise',
  'Collect an exclusive Pathixo engineering notebook, metal pen, or tech swag package at our booth.',
  'merchandise',
  25,
  25,
  10,
  false, -- PLACEHOLDER: Pending Pathixo approval
  3,
  'Claim immediately at the Pathixo exhibition booth counter by showing this redemption code.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  reward_type = EXCLUDED.reward_type,
  total_inventory = EXCLUDED.total_inventory,
  remaining_inventory = EXCLUDED.remaining_inventory,
  probability_weight = EXCLUDED.probability_weight,
  is_active = EXCLUDED.is_active,
  expiry_days = EXCLUDED.expiry_days,
  redemption_instructions = EXCLUDED.redemption_instructions;
