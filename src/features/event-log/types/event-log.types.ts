export type EventLogStatus = "SUCCESS" | "ERROR" | "SKIPPED";

export type EventLogItem = {
  id: string;
  type: string;
  message: string;
  status: EventLogStatus | string;
  createdAt: string;
};
