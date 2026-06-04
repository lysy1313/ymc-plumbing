import { describe, expect, it } from "vitest";
import { createLeadSchema } from "./lead.schema";

const validLead = {
  firstName: "John",
  lastName: "Smith",
  phone: "+1 555 123 4567",
  email: "john.smith@example.com",
  source: "Phone Call",
  issue: "Client reported a leaking pipe under the kitchen sink.",
  address: "123 Main Street",
  city: "Austin",
  zipCode: "73301",
  area: "North Austin",
};

describe("createLeadSchema", () => {
  it("accepts a valid lead payload", () => {
    const result = createLeadSchema.safeParse(validLead);

    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      firstName: "",
      phone: "",
      issue: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.firstName).toBeDefined();
      expect(errors.phone).toBeDefined();
      expect(errors.issue).toBeDefined();
    }
  });

  it("rejects an invalid email", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      email: "wrong-email",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("allows an empty optional email", () => {
    const result = createLeadSchema.safeParse({
      ...validLead,
      email: "",
    });

    expect(result.success).toBe(true);
  });
});
