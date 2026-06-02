"use client";

import { EventLog } from "@/features/event-log/components/EventLog";
import { CreateJobForm } from "@/features/jobs/components/CreateJobForm";
import { JobCard } from "@/features/jobs/components/JobCard";
import { type JobStatus } from "@/features/jobs/types/job.types";
import { LeadCard } from "@/features/leads/components/LeadCard";
import { mockLeads } from "@/features/leads/data/mockLeads";
import { Modal } from "@/shared/components/Modal";
import { useEffect, useMemo, useState } from "react";

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
  const [jobsError, setJobsError] = useState<string | null>(null);

  const lead = mockLeads[0];

  async function fetchJobsFromApi(): Promise<Job[]> {
    const response = await fetch("/api/jobs", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load jobs");
    }

    const data = await response.json();

    return data.jobs ?? [];
  }

  async function loadJobs() {
    setIsLoadingJobs(true);
    setJobsError(null);

    try {
      const nextJobs = await fetchJobsFromApi();
      setJobs(nextJobs);
    } catch {
      setJobsError("Failed to load jobs. Please try again.");
    } finally {
      setIsLoadingJobs(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialJobs() {
      try {
        const nextJobs = await fetchJobsFromApi();

        if (isMounted) {
          setJobs(nextJobs);
        }
      } catch {
        if (isMounted) {
          setJobsError("Failed to load jobs. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingJobs(false);
        }
      }
    }

    void loadInitialJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStatusChange(jobId: string, status: JobStatus) {
    setUpdatingJobId(jobId);

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      await loadJobs();
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingJobId(null);
    }
  }

  const allEvents = useMemo(() => {
    return jobs
      .flatMap((job) => job.events ?? [])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [jobs]);

  return (
    <main className="min-h-screen ">
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
          <Modal
            isOpen={isCreateOpen}
            title="Create a job"
            description="Fill in client, job, location and schedule details."
            onClose={() => setIsCreateOpen(false)}
          >
            <CreateJobForm
              lead={lead}
              onCancel={() => setIsCreateOpen(false)}
              onSuccess={async () => {
                setIsCreateOpen(false);
                await loadJobs();
              }}
            />
          </Modal>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Jobs</h2>
                <p className="text-sm text-slate-500">
                  Created jobs and status flow.
                </p>
              </div>
            </div>

            {jobsError ? (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {jobsError}
              </div>
            ) : null}

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
