import { z } from "zod";
import { createJobSchema } from "@/features/jobs/schemas/job.schema";
import { JOB_STATUSES, type JobStatus } from "@/features/jobs/types/job.types";
import { prisma } from "@/server/db/prisma";
import { runJobAutomations } from "@/server/services/automation.service";

export async function getJobs(params?: { leadId?: string }) {
  return prisma.job.findMany({
    where: params?.leadId
      ? {
          leadId: params.leadId,
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      events: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function createJob(input: unknown) {
  const data = createJobSchema.parse(input);

  const job = await prisma.$transaction(async (tx) => {
    const createdJob = await tx.job.create({
      data: {
        ...data,
        email: data.email || null,
        status: JOB_STATUSES.JOB_CREATED,
      },
    });

    await tx.eventLog.create({
      data: {
        jobId: createdJob.id,
        type: "JOB_CREATED",
        message: `Job created — ${createdJob.firstName} ${createdJob.lastName} — ${createdJob.jobType}`,
        status: "SUCCESS",
      },
    });

    return createdJob;
  });

  const automationResults = await runJobAutomations({
    action: "JOB_CREATED",
    job,
  });

  return {
    job,
    automationResults,
  };
}

const ALLOWED_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  JOB_CREATED: [JOB_STATUSES.SCHEDULED, JOB_STATUSES.LOST_CANCELLED],
  SCHEDULED: [JOB_STATUSES.IN_PROGRESS, JOB_STATUSES.LOST_CANCELLED],
  IN_PROGRESS: [JOB_STATUSES.COMPLETED, JOB_STATUSES.LOST_CANCELLED],
  COMPLETED: [],
  LOST_CANCELLED: [],
};

export const updateJobStatusSchema = z.object({
  status: z.enum([
    JOB_STATUSES.JOB_CREATED,
    JOB_STATUSES.SCHEDULED,
    JOB_STATUSES.IN_PROGRESS,
    JOB_STATUSES.COMPLETED,
    JOB_STATUSES.LOST_CANCELLED,
  ]),
  note: z.string().optional(),
});

export async function updateJobStatus(jobId: string, input: unknown) {
  const data = updateJobStatusSchema.parse(input);

  const existingJob = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
  });

  if (!existingJob) {
    throw new Error("JOB_NOT_FOUND");
  }

  const currentStatus = existingJob.status as JobStatus;
  const nextStatus = data.status;
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const job = await prisma.$transaction(async (tx) => {
    const updatedJob = await tx.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: nextStatus,
      },
    });

    await tx.eventLog.create({
      data: {
        jobId: updatedJob.id,
        type: "STATUS_CHANGED",
        message: `Status changed — ${nextStatus}${data.note ? ` — ${data.note}` : ""}`,
        status: "SUCCESS",
      },
    });

    return updatedJob;
  });

  const automationResults = await runJobAutomations({
    action: "STATUS_CHANGED",
    job,
  });

  return {
    job,
    automationResults,
  };
}
