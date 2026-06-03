import { z } from "zod";

export const LEAD_SOURCES = [
  "Phone Call",
  "Website",
  "Google Ads",
  "Referral",
  "Walk-in",
] as const;

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(5, "Phone is required"),

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

  issue: z.string().min(1, "Issue is required"),

  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  area: z.string().optional(),
});

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>;
