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

    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    area: z.string().optional(),

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
