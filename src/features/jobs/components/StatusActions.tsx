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
  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((status) => (
        <Button
          key={status}
          type="button"
          variant={
            status === JOB_STATUSES.LOST_CANCELLED ? "danger" : "secondary"
          }
          disabled={disabled || currentStatus === status}
          onClick={() => onChangeStatus(status)}
        >
          {JOB_STATUS_LABELS[status]}
        </Button>
      ))}
    </div>
  );
}
