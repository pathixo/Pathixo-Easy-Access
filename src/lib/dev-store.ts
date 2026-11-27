import "server-only";
import crypto from "crypto";

export interface DevVisitor {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  created_at: string;
}

export interface DevReward {
  id: string;
  slug: string;
  name: string;
  display_label: string;
  description: string;
  reward_type: string;
  total_inventory: number;
  remaining_inventory: number;
  max_cap: number | null;
  claimed_count: number;
  probability_weight: number;
  is_active: boolean;
  expiry_days: number;
  redemption_instructions: string;
}

export interface DevSpin {
  id: string;
  visitor_id: string;
  reward_id: string;
  idempotency_key: string;
  reward_code: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  prize_label: string;
  redemption_status: string;
  fulfillment_status: string;
  email_status: string;
  email_error: string | null;
  expires_at: string;
  redeemed_at: string | null;
  created_at: string;
}

export interface DevInquiry {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  company: string | null;
  service_needed: string | null;
  project_description: string;
  estimated_budget: string | null;
  lead_status: string;
  notes: string | null;
  created_at: string;
}

export interface DevAuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

interface DevStoreState {
  visitors: DevVisitor[];
  rewards: DevReward[];
  spins: DevSpin[];
  inquiries: DevInquiry[];
  auditLogs: DevAuditLog[];
}

const INITIAL_REWARDS: DevReward[] = [
  {
    id: "rew-1",
    slug: "vakxo-1-year",
    name: "1-Year Vakxo Pro Subscription",
    display_label: "1-Yr Vakxo",
    description: "Full 12-month access to Vakxo AI developer environment with unlimited voice actions and terminal automation.",
    reward_type: "credit",
    total_inventory: 2,
    remaining_inventory: 2,
    max_cap: 2,
    claimed_count: 0,
    probability_weight: 2,
    is_active: true,
    expiry_days: 90,
    redemption_instructions: "Show this code at the booth or reply to your voucher confirmation email to activate your 1-Year Vakxo Pro license.",
  },
  {
    id: "rew-2",
    slug: "vakxo-1-month",
    name: "1-Month Vakxo Pro Access",
    display_label: "1-Mo Vakxo",
    description: "Enjoy 30 days of Vakxo Pro AI workspace platform for your development team.",
    reward_type: "credit",
    total_inventory: 50,
    remaining_inventory: 50,
    max_cap: 50,
    claimed_count: 0,
    probability_weight: 35,
    is_active: true,
    expiry_days: 30,
    redemption_instructions: "Present this code at the Pathixo counter to receive your license key.",
  },
  {
    id: "rew-3",
    slug: "discount-30-vakxo",
    name: "30% Off Vakxo Annual Plan",
    display_label: "30% Vakxo",
    description: "30% discount voucher applied to the Vakxo AI developer platform annual subscription.",
    reward_type: "discount",
    total_inventory: 0,
    remaining_inventory: 0,
    max_cap: null,
    claimed_count: 0,
    probability_weight: 15,
    is_active: true,
    expiry_days: 30,
    redemption_instructions: "Apply this voucher code at checkout on vakxo.com or show it to our booth team.",
  },
  {
    id: "rew-4",
    slug: "discount-20-vakxo",
    name: "20% Off Vakxo Pro Subscription",
    display_label: "20% Vakxo",
    description: "20% discount voucher applied to Vakxo Pro monthly or annual developer license.",
    reward_type: "discount",
    total_inventory: 0,
    remaining_inventory: 0,
    max_cap: null,
    claimed_count: 0,
    probability_weight: 15,
    is_active: true,
    expiry_days: 60,
    redemption_instructions: "Apply this voucher code at checkout on vakxo.com or show it to our booth team.",
  },
  {
    id: "rew-5",
    slug: "discount-50-krocpdf",
    name: "50% Off krocPDF Pro Access",
    display_label: "50% kroc",
    description: "50% discount on krocPDF Pro high-speed document intelligence and OCR suite.",
    reward_type: "discount",
    total_inventory: 0,
    remaining_inventory: 0,
    max_cap: null,
    claimed_count: 0,
    probability_weight: 10,
    is_active: true,
    expiry_days: 45,
    redemption_instructions: "Use this voucher code at checkout inside krocPDF to claim your 50% discount.",
  },
  {
    id: "rew-6",
    slug: "krocpdf-6-month",
    name: "6-Month krocPDF Pro Access",
    display_label: "6M krocPDF",
    description: "6 months of unlimited, high-speed in-browser PDF manipulation and document extraction with krocPDF Pro.",
    reward_type: "credit",
    total_inventory: 0,
    remaining_inventory: 0,
    max_cap: null,
    claimed_count: 0,
    probability_weight: 8,
    is_active: true,
    expiry_days: 60,
    redemption_instructions: "Enter this voucher code inside krocPDF to unlock 6 months of Pro tier access.",
  },
  {
    id: "rew-7",
    slug: "extended-trial-3mo",
    name: "3-Month krocPDF Team Pass",
    display_label: "3M krocPDF",
    description: "Unlimited fast in-browser document processing and structured extraction for your entire team.",
    reward_type: "credit",
    total_inventory: 0,
    remaining_inventory: 0,
    max_cap: null,
    claimed_count: 0,
    probability_weight: 15,
    is_active: true,
    expiry_days: 60,
    redemption_instructions: "Use this pass code to activate team access on krocPDF.",
  },
  {
    id: "rew-8",
    slug: "vakxo-6-month",
    name: "6-Month Vakxo Pro Subscription",
    display_label: "6-Mo Vakxo",
    description: "6-Month access to Vakxo AI developer environment with voice actions and terminal automation.",
    reward_type: "credit",
    total_inventory: 0,
    remaining_inventory: 0,
    max_cap: null,
    claimed_count: 0,
    probability_weight: 0,
    is_active: true,
    expiry_days: 90,
    redemption_instructions: "Special promotional tier voucher code.",
  },
];

const globalForDevStore = globalThis as unknown as { __pxDevStore?: DevStoreState };

export function getDevStore(): DevStoreState {
  if (!globalForDevStore.__pxDevStore) {
    globalForDevStore.__pxDevStore = {
      visitors: [],
      rewards: INITIAL_REWARDS.map((r) => ({ ...r })),
      spins: [],
      inquiries: [],
      auditLogs: [],
    };
  }
  if (!globalForDevStore.__pxDevStore.auditLogs) {
    globalForDevStore.__pxDevStore.auditLogs = [];
  }
  return globalForDevStore.__pxDevStore;
}

export function generateDevCode(): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let code = "PX-";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return code;
}

export function executeDevSpin(visitorId: string, idempotencyKey: string) {
  const store = getDevStore();
  const existing = store.spins.find(
    (s) => s.visitor_id === visitorId || s.idempotency_key === idempotencyKey
  );

  if (existing) {
    const rew = store.rewards.find((r) => r.id === existing.reward_id) || store.rewards[7];
    return {
      ok: true,
      already_spun: true,
      spin_id: existing.id,
      reward_id: rew.id,
      reward_name: rew.name,
      display_label: rew.display_label,
      reward_slug: rew.slug,
      reward_type: rew.reward_type,
      reward_description: rew.description,
      reward_code: existing.reward_code,
      expires_at: existing.expires_at,
      redemption_status: existing.redemption_status,
      fulfillment_status: existing.fulfillment_status,
      email_status: existing.email_status,
      redemption_instructions: rew.redemption_instructions,
    };
  }

  const visitor = store.visitors.find((v) => v.id === visitorId);
  if (!visitor) {
    return {
      ok: false,
      error: { code: "VISITOR_NOT_FOUND", message: "Invalid visitor identification" },
    };
  }

  const eligible = store.rewards.filter(
    (r) =>
      r.is_active &&
      r.probability_weight > 0 &&
      (r.max_cap === null || r.claimed_count < r.max_cap) &&
      (r.total_inventory === 0 || r.remaining_inventory > 0)
  );

  const totalWeight = eligible.reduce((sum, r) => sum + r.probability_weight, 0);
  let chosen: DevReward;

  if (totalWeight <= 0) {
    chosen = store.rewards.find((r) => r.reward_type === "no_prize") || store.rewards[7];
  } else {
    const point = crypto.randomInt(1, totalWeight + 1);
    let running = 0;
    chosen = eligible[eligible.length - 1];
    for (const r of eligible) {
      running += r.probability_weight;
      if (running >= point) {
        chosen = r;
        break;
      }
    }
  }

  chosen.claimed_count += 1;
  if (chosen.remaining_inventory > 0) {
    chosen.remaining_inventory -= 1;
  }

  const code = generateDevCode();
  const expiresAt = new Date(Date.now() + chosen.expiry_days * 86400000).toISOString();
  const spinId = crypto.randomUUID();

  const newSpin: DevSpin = {
    id: spinId,
    visitor_id: visitor.id,
    reward_id: chosen.id,
    idempotency_key: idempotencyKey,
    reward_code: code,
    user_name: visitor.full_name,
    user_phone: visitor.mobile,
    user_email: visitor.email,
    prize_label: chosen.name,
    redemption_status: "not_redeemed",
    fulfillment_status: "unclaimed",
    email_status: "pending",
    email_error: null,
    expires_at: expiresAt,
    redeemed_at: null,
    created_at: new Date().toISOString(),
  };

  store.spins.unshift(newSpin);

  return {
    ok: true,
    already_spun: false,
    spin_id: spinId,
    reward_id: chosen.id,
    reward_name: chosen.name,
    display_label: chosen.display_label,
    reward_slug: chosen.slug,
    reward_type: chosen.reward_type,
    reward_description: chosen.description,
    reward_code: code,
    expires_at: expiresAt,
    redemption_status: "not_redeemed",
    fulfillment_status: "unclaimed",
    email_status: "pending",
    redemption_instructions: chosen.redemption_instructions,
  };
}
