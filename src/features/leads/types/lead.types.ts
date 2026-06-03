import { LEAD_SOURCES } from "@/features/leads/schemas/lead.schema";

export type LeadSource = (typeof LEAD_SOURCES)[number];

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  source: LeadSource | string;
  issue: string;
  address: string;
  city: string;
  zipCode: string;
  area?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    jobs: number;
  };
};
