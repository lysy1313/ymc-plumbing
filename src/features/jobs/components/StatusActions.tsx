import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  type JobStatus,
} from "@/features/jobs/types/job.types";
import { Button } from "@/shared/components/Button";

type StatusActionsProps = {
  currentStatus: JobStatus;
  onChangeStatus: (status: JobStatus) => void;
  disabled?: boolean;
};

const allowedTransitions: Record<JobStatus, JobStatus[]> = {
  JOB_CREATED: [JOB_STATUSES.SCHEDULED, JOB_STATUSES.LOST_CANCELLED],
  SCHEDULED: [JOB_STATUSES.IN_PROGRESS, JOB_STATUSES.LOST_CANCELLED],
  IN_PROGRESS: [JOB_STATUSES.COMPLETED, JOB_STATUSES.LOST_CANCELLED],
  COMPLETED: [],
  LOST_CANCELLED: [],
};

export function StatusActions({
  currentStatus,
  onChangeStatus,
  disabled,
}: StatusActionsProps) {
  const availableStatuses = allowedTransitions[currentStatus];

  if (availableStatuses.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        This job is finished. No more status actions are available.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableStatuses.map((status) => (
        <Button
          key={status}
          type="button"
          variant={
            status === JOB_STATUSES.LOST_CANCELLED ? "danger" : "secondary"
          }
          disabled={disabled}
          onClick={() => onChangeStatus(status)}
        >
          Move to {JOB_STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
