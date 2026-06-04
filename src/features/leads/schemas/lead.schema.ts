import { z } from "zod";

export const LEAD_SOURCES = [
  "Phone Call",
  "Website",
  "Google Ads",
  "Referral",
  "Walk-in",
] as const;

export const createLeadSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().min(5, "Phone is required"),

  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Invalid email",
    }),

  source: z.enum(LEAD_SOURCES, {
    message: "Lead source is required",
  }),

  issue: z.string().trim().min(1, "Issue is required"),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .refine((value) => /\d/.test(value), {
      message: "Address should include a street number",
    })
    .refine((value) => /[a-zA-Z]/.test(value), {
      message: "Address should include a street name",
    }),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "City can contain only letters, spaces, hyphens and apostrophes",
    ),
  zipCode: z
    .string()
    .trim()
    .regex(
      /^\d{5}(-\d{4})?$/,
      "Zip code must be in US format, for example 73301 or 73301-1234",
    ),
  area: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || value.length >= 2, {
      message: "Area must be at least 2 characters",
    }),
});

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>;
