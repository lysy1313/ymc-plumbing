import { prisma } from "@/server/db/prisma";
import { createJobSchema } from "@/features/jobs/schemas/job.schema";
import { JOB_STATUSES, type JobStatus } from "@/features/jobs/types/job.types";
import { z } from "zod";

export async function getJobs() {
  return prisma.job.findMany({
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

  return prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        ...data,
        email: data.email || null,
        status: JOB_STATUSES.JOB_CREATED,
      },
    });

    await tx.eventLog.create({
      data: {
        jobId: job.id,
        type: "JOB_CREATED",
        message: `Job created — ${job.firstName} ${job.lastName} — ${job.jobType}`,
        status: "SUCCESS",
      },
    });

    return job;
  });
}

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

  return prisma.$transaction(async (tx) => {
    const job = await tx.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: data.status satisfies JobStatus,
      },
    });

    await tx.eventLog.create({
      data: {
        jobId: job.id,
        type: "STATUS_CHANGED",
        message: `Status changed — ${data.status}${data.note ? ` — ${data.note}` : ""}`,
        status: "SUCCESS",
      },
    });

    return job;
  });
}
