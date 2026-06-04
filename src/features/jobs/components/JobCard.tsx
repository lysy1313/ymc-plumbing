"use client";

import {
  Job,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  type JobStatus,
} from "@/features/jobs/types/job.types";
import { StatusActions } from "./StatusActions";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { useState } from "react";
import { Modal } from "@/shared/components/Modal";

type JobCardProps = {
  job: Job;
  onChangeStatus: (
    jobId: string,
    status: JobStatus,
    cancellationReason?: string,
  ) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  isUpdating?: boolean;
};

const JOB_STATUS_BADGE_CLASSES: Record<JobStatus, string> = {
  [JOB_STATUSES.JOB_CREATED]: "bg-sky-50 text-sky-700 border-sky-200",
  [JOB_STATUSES.SCHEDULED]: "bg-indigo-50 text-indigo-700 border-indigo-200",
  [JOB_STATUSES.IN_PROGRESS]: "bg-amber-50 text-amber-700 border-amber-200",
  [JOB_STATUSES.COMPLETED]: "bg-green-50 text-green-700 border-green-200",
  [JOB_STATUSES.LOST_CANCELLED]: "bg-red-50 text-red-700 border-red-200",
};

export function JobCard({
  job,
  onChangeStatus,
  isUpdating,
  onDeleteJob,
}: JobCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isFinished =
    job.status === JOB_STATUSES.COMPLETED ||
    job.status === JOB_STATUSES.LOST_CANCELLED;

  const isCancellationReason =
    job.status === JOB_STATUSES.LOST_CANCELLED && job.cancellationReason;

  return (
    <>
      <Card className={isFinished ? "bg-slate-50" : "bg-white"}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Job #{job.id.slice(-6)}
            </p>

            <h3 className="mt-1 break-words text-lg font-semibold text-slate-950">
              {job.firstName} {job.lastName} — {job.jobType}
            </h3>

            <p className="mt-1 break-words text-sm text-slate-500">
              {job.address}, {job.city}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
              JOB_STATUS_BADGE_CLASSES[job.status]
            }`}
          >
            {JOB_STATUS_LABELS[job.status]}
          </span>
        </div>

        <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3 my-2">
          <p>
            <span className="block text-xs text-slate-500">Phone</span>
            <strong>{job.phone}</strong>
          </p>

          <p>
            <span className="block text-xs text-slate-500">Technician</span>
            <strong>{job.technician}</strong>
          </p>

          <p>
            <span className="block text-xs text-slate-500">Scheduled</span>
            <strong>
              {job.startDate}, {job.startTime} - {job.endTime}
            </strong>
          </p>
        </div>

        {isCancellationReason ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span className="block text-xs font-semibold uppercase tracking-wide">
              Cancellation reason
            </span>
            <p className="mt-1">{job.cancellationReason}</p>
          </div>
        ) : null}

        <StatusActions
          currentStatus={job.status}
          disabled={isUpdating}
          onChangeStatus={(status, cancellationReason) =>
            onChangeStatus(job.id, status, cancellationReason)
          }
        />
        <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="danger"
            disabled={isUpdating}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete job
          </Button>
        </div>
      </Card>
      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete job"
        description="This action will delete the job from the database and Google Sheets."
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Are you sure you want to delete this job? This action cannot be
            undone.
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              disabled={isUpdating}
              onClick={() => {
                onDeleteJob(job.id);
                setIsDeleteModalOpen(false);
              }}
            >
              Delete job
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
