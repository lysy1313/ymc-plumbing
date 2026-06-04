"use client";

import { useState } from "react";
import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  type JobStatus,
} from "@/features/jobs/types/job.types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";

type StatusActionsProps = {
  currentStatus: JobStatus;
  onChangeStatus: (status: JobStatus, cancellationReason?: string) => void;
  disabled?: boolean;
};

const nextStatuses: JobStatus[] = [
  JOB_STATUSES.SCHEDULED,
  JOB_STATUSES.IN_PROGRESS,
  JOB_STATUSES.COMPLETED,
  JOB_STATUSES.LOST_CANCELLED,
];

export function StatusActions({
  currentStatus,
  onChangeStatus,
  disabled,
}: StatusActionsProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const isCancelled = currentStatus === JOB_STATUSES.LOST_CANCELLED;
  const isCompleted = currentStatus === JOB_STATUSES.COMPLETED;

  function handleStatusClick(status: JobStatus) {
    if (status === JOB_STATUSES.LOST_CANCELLED) {
      setIsCancelModalOpen(true);
      return;
    }

    onChangeStatus(status);
  }

  function handleConfirmCancellation() {
    const reason = cancellationReason.trim();

    if (!reason) {
      return;
    }

    onChangeStatus(JOB_STATUSES.LOST_CANCELLED, reason);
    setCancellationReason("");
    setIsCancelModalOpen(false);
  }

  if (isCancelled) {
    return null;
  }

  if (isCompleted) {
    return (
      <p className="text-sm text-slate-500">
        This job is completed. No more status actions are available.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            type="button"
            variant={
              status === JOB_STATUSES.LOST_CANCELLED ? "danger" : "secondary"
            }
            disabled={disabled || currentStatus === status}
            onClick={() => handleStatusClick(status)}
          >
            {JOB_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        title="Cancel job"
        description="Add a short reason why this job was lost or cancelled."
        onClose={() => setIsCancelModalOpen(false)}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Cancellation reason
            </span>

            <textarea
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              placeholder="Example: Client decided to postpone the service."
            />
          </label>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              disabled={!cancellationReason.trim()}
              onClick={handleConfirmCancellation}
            >
              Save reason
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
