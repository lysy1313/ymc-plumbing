import { describe, expect, it } from "vitest";
import { createJobSchema } from "./job.schema";

const validJob = {
  leadId: "lead_001",

  firstName: "John",
  lastName: "Smith",
  phone: "+1 555 123 4567",
  email: "john.smith@example.com",

  jobType: "Pipe Leak",
  jobSource: "Phone Call",
  description: "Client reported a leaking pipe under the kitchen sink.",

  address: "123 Main Street",
  city: "Austin",
  zipCode: "73301",
  area: "North Austin",

  startDate: "2026-06-04",
  startTime: "10:00",
  endTime: "11:00",
  technician: "Alex Brown",
};

describe("createJobSchema", () => {
  it("accepts a valid job payload", () => {
    const result = createJobSchema.safeParse(validJob);

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = createJobSchema.safeParse({
      ...validJob,
      email: "invalid-email",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects end time earlier than start time", () => {
    const result = createJobSchema.safeParse({
      ...validJob,
      startTime: "12:00",
      endTime: "11:00",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endTime).toBeDefined();
    }
  });

  it("rejects missing required job fields", () => {
    const result = createJobSchema.safeParse({
      ...validJob,
      leadId: "",
      jobType: "",
      technician: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.leadId).toBeDefined();
      expect(errors.jobType).toBeDefined();
      expect(errors.technician).toBeDefined();
    }
  });
});
