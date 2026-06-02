import { JOB_SOURCES } from "@/features/jobs/types/job.types";

export type LeadSource = (typeof JOB_SOURCES)[number];

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  source: LeadSource;
  issue: string;
  address: string;
  city: string;
  zipCode: string;
  area: string;
};
