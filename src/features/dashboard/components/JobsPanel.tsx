import { JobCard } from "@/features/jobs/components/JobCard";
import { type Job, type JobStatus } from "@/features/jobs/types/job.types";
import { type Lead } from "@/features/leads/types/lead.types";

type JobsPanelProps = {
  selectedLead: Lead | null;
  jobs: Job[];
  isLoadingJobs: boolean;
  updatingJobId: string | null;
  onChangeStatus: (
    jobId: string,
    status: JobStatus,
    cancellationReason?: string,
  ) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
};

export function JobsPanel({
  selectedLead,
  jobs,
  isLoadingJobs,
  updatingJobId,
  onChangeStatus,
  onDeleteJob,
}: JobsPanelProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Jobs</h2>
          <p className="text-sm text-slate-500">
            Jobs created from the selected lead.
          </p>
        </div>
      </div>

      {!selectedLead ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Select or create a lead to view jobs.
          </p>
        </div>
      ) : isLoadingJobs ? (
        <p className="text-sm text-slate-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            No jobs yet. Create the first job for this lead.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isUpdating={updatingJobId === job.id}
              onChangeStatus={onChangeStatus}
              onDeleteJob={onDeleteJob}
            />
          ))}
        </div>
      )}
    </div>
  );
}
