import { prisma } from "@/server/db/prisma";

type EventLogStatus = "SUCCESS" | "ERROR" | "SKIPPED";

type CreateEventLogParams = {
  jobId?: string;
  type: string;
  message: string;
  status?: EventLogStatus;
};

export async function createEventLog({
  jobId,
  type,
  message,
  status = "SUCCESS",
}: CreateEventLogParams) {
  return prisma.eventLog.create({
    data: {
      jobId,
      type,
      message,
      status,
    },
  });
}
