"use client";

import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/features/leads/data/mockLeads";
import { LeadCard } from "@/features/leads/components/LeadCard";
import { CreateJobForm } from "@/features/jobs/components/CreateJobForm";
import { JobCard } from "@/features/jobs/components/JobCard";
import { EventLog } from "@/features/event-log/components/EventLog";
import { type JobStatus } from "@/features/jobs/types/job.types";
import { Button } from "@/shared/components/Button";

type EventLogItem = {
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
  events: EventLogItem[];
};

export function CrmDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  const lead = mockLeads[0];

  async function loadJobs() {
    setIsLoadingJobs(true);

    const response = await fetch("/api/jobs");
    const data = await response.json();

    setJobs(data.jobs ?? []);
    setIsLoadingJobs(false);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleStatusChange(jobId: string, status: JobStatus) {
    setUpdatingJobId(jobId);

    await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "lication/json",
      },
      body: JSON.stringify({ status }),
    });

    await loadJobs();
    setUpdatingJobId(null);
  }

  const allEvents = useMemo(() => {
    return jobs.flatMap((job) => job.events ?? []);
  }, [jobs]);

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            YMC Plumbing
          </p>
          <h1 className="mt-2 text-3xl font-bold">Lead to Job CRM Flow</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Internal dashboard for creating plumbing jobs from incoming leads
            and moving them through statuses.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <LeadCard lead={lead} onCreateJob={() => setIsCreateOpen(true)} />
          <EventLog events={allEvents} />
        </div>

        <div className="space-y-6">
          {isCreateOpen ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Create a job
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill in client, job, location and schedule details.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Close
                </Button>
              </div>

              <CreateJobForm
                lead={lead}
                onCancel={() => setIsCreateOpen(false)}
                onSuccess={async () => {
                  setIsCreateOpen(false);
                  await loadJobs();
                }}
              />
            </div>
          ) : null}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Jobs</h2>
                <p className="text-sm text-slate-500">
                  Created jobs and status flow.
                </p>
              </div>
            </div>

            {isLoadingJobs ? (
              <p className="text-sm text-slate-500">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm text-slate-500">
                  No jobs yet. Open the lead and create the first job.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isUpdating={updatingJobId === job.id}
                    onChangeStatus={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
