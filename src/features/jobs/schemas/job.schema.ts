import * as z from "zod";
import { JOB_SOURCES, JOB_TYPES, TECHNICIANS } from "../types/job.types";

export const createJobSchema = z
  .object({
    leadId: z.string().min(1, "Lead is required"),

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

    jobType: z.enum(JOB_TYPES, {
      message: "Job type is required",
    }),

    jobSource: z.enum(JOB_SOURCES, {
      message: "Job source is required",
    }),

    description: z.string().optional(),

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

    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),

    technician: z.enum(TECHNICIANS, {
      message: "Technician is required",
    }),
  })
  .refine((data) => data.endTime > data.startTime, {
    path: ["endTime"],
    message: "End time must be later than start time",
  });

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
