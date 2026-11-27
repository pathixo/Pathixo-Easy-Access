import { z } from "zod";

/**
 * Normalizes Indian phone numbers:
 * - Strips whitespace, dashes, parens
 * - Removes leading "+91", "91", or "0"
 * - Returns clean 10-digit number
 */
export function normalizeIndianMobile(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}

export const mobileSchema = z
  .string()
  .min(1, "Mobile number is required")
  .transform(normalizeIndianMobile)
  .pipe(
    z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Invalid mobile number. Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9."
      )
  );

export const emailSchema = z
  .string()
  .min(1, "Email address is required")
  .trim()
  .toLowerCase()
  .email("Invalid email address format")
  .max(255, "Email address is too long");

/**
 * Visitor registration schema
 */
export const registerSchema = z
  .object({
    full_name: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(120, "Full name cannot exceed 120 characters"),
    email: emailSchema,
    mobile: mobileSchema,
    company: z.string().trim().max(150, "Company name cannot exceed 150 characters").optional().nullable(),
    designation: z.string().trim().max(100, "Designation cannot exceed 100 characters").optional().nullable(),
    interested_product: z
      .string()
      .trim()
      .max(100, "Product interest cannot exceed 100 characters")
      .optional()
      .nullable(),
    message: z.string().trim().max(1000, "Message cannot exceed 1000 characters").optional().nullable(),
    privacy_consent: z.literal(true, {
      errorMap: () => ({ message: "You must accept the privacy policy to participate." }),
    }),
    marketing_consent: z.boolean().default(false).optional(),
    turnstile_token: z.string().optional().nullable(),
    utm_source: z.string().trim().max(100).optional().nullable(),
    utm_medium: z.string().trim().max(100).optional().nullable(),
    utm_campaign: z.string().trim().max(100).optional().nullable(),
    utm_term: z.string().trim().max(100).optional().nullable(),
    utm_content: z.string().trim().max(100).optional().nullable(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Business inquiry schema
 */
export const inquirySchema = z
  .object({
    full_name: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(120, "Full name cannot exceed 120 characters"),
    email: emailSchema,
    mobile: mobileSchema,
    company: z.string().trim().max(150, "Company name cannot exceed 150 characters").optional().nullable(),
    service_needed: z
      .string()
      .trim()
      .max(100, "Service category cannot exceed 100 characters")
      .optional()
      .nullable(),
    project_description: z
      .string({ required_error: "Project description is required" })
      .trim()
      .min(10, "Project description must be at least 10 characters")
      .max(3000, "Project description cannot exceed 3000 characters"),
    estimated_budget: z.string().trim().max(100).optional().nullable(),
    turnstile_token: z.string().optional().nullable(),
  })
  .strict();

export type InquiryInput = z.infer<typeof inquirySchema>;

/**
 * Anonymous telemetry events schema
 */
export const ALLOWED_EVENT_TYPES = [
  "page_view",
  "registration_start",
  "registration_complete",
  "product_card_click",
  "product_link_click",
  "spin_start",
  "spin_complete",
] as const;

export const eventSchema = z
  .object({
    event_type: z.enum(ALLOWED_EVENT_TYPES),
    product_slug: z.string().trim().max(50).optional().nullable(),
    metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
  })
  .strict();

export type EventInput = z.infer<typeof eventSchema>;
