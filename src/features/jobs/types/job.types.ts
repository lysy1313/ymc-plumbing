import { EventLogItem } from "@/features/event-log/types/event-log.types";

export const JOB_STATUSES = {
  JOB_CREATED: "JOB_CREATED",
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  LOST_CANCELLED: "LOST_CANCELLED",
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  JOB_CREATED: "Job Created",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  LOST_CANCELLED: "Lost / Cancelled",
};

export const JOB_TYPES = [
  "Pipe Leak",
  "Drain Cleaning",
  "Water Heater",
  "Emergency Repair",
  "Inspection",
] as const;

export const JOB_SOURCES = [
  "Phone Call",
  "Website",
  "Google Ads",
  "Referral",
  "Walk-in",
] as const;

export const TECHNICIANS = [
  "Mike Johnson",
  "Alex Brown",
  "David Wilson",
] as const;

export type Job = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  jobType: string;
  jobSource?: string;
  description?: string | null;
  address: string;
  city: string;
  zipCode?: string;
  area?: string | null;
  startDate: string;
  startTime: string;
  endTime: string;
  technician: string;
  status: JobStatus;
  cancellationReason?: string | null;
  events: EventLogItem[];
};
