import { Lead } from "../types/lead.types";

export const mockLeads: Lead[] = [
  {
    id: "lead_001",
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
  },
];
