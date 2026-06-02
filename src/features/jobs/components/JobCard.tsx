import {
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  type JobStatus,
} from "@/features/jobs/types/job.types";
import { StatusActions } from "./StatusActions";
import { Card } from "@/shared/components/Card";

type EventLog = {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
};

type Job = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobType: string;
  address: string;
  city: string;
  startDate: string;
  startTime: string;
  endTime: string;
  technician: string;
  status: JobStatus;
  events: EventLog[];
};

type JobCardProps = {
  job: Job;
  onChangeStatus: (jobId: string, status: JobStatus) => void;
  isUpdating?: boolean;
};

export function JobCard({ job, onChangeStatus, isUpdating }: JobCardProps) {
  const JOB_STATUS_BADGE_CLASSES: Record<JobStatus, string> = {
    [JOB_STATUSES.JOB_CREATED]: "bg-sky-50 text-sky-700 border-sky-200",
    [JOB_STATUSES.SCHEDULED]: "bg-indigo-50 text-indigo-700 border-indigo-200",
    [JOB_STATUSES.IN_PROGRESS]: "bg-amber-50 text-amber-700 border-amber-200",
    [JOB_STATUSES.COMPLETED]: "bg-green-50 text-green-700 border-green-200",
    [JOB_STATUSES.LOST_CANCELLED]: "bg-red-50 text-red-700 border-red-200",
  };

  const isFinished =
    job.status === JOB_STATUSES.COMPLETED ||
    job.status === JOB_STATUSES.LOST_CANCELLED;

  return (
    <Card className={isFinished ? "opacity-50" : ""}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Job #{job.id.slice(-6)}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">
            {job.firstName} {job.lastName} — {job.jobType}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {job.address}, {job.city}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
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

      <StatusActions
        currentStatus={job.status}
        disabled={isUpdating}
        onChangeStatus={(status) => onChangeStatus(job.id, status)}
      />
    </Card>
  );
}
