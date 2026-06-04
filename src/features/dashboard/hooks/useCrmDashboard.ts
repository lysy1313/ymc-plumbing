"use client";

import { useEffect, useMemo, useState } from "react";
import { type JobStatus } from "@/features/jobs/types/job.types";
import { type Lead } from "@/features/leads/types/lead.types";
import { type Job } from "@/features/jobs/types/job.types";
import { toast } from "sonner";

export function useCrmDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedLead = useMemo(() => {
    return leads.find((lead) => lead.id === selectedLeadId) ?? null;
  }, [leads, selectedLeadId]);

  const allEvents = useMemo(() => {
    return jobs.flatMap((job) => job.events ?? []);
  }, [jobs]);

  async function fetchLeadsFromApi(): Promise<Lead[]> {
    const response = await fetch("/api/leads", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load leads");
    }

    const data = await response.json();
    return data.leads ?? [];
  }

  async function fetchJobsFromApi(leadId: string): Promise<Job[]> {
    const response = await fetch(`/api/jobs?leadId=${leadId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load jobs");
    }

    const data = await response.json();
    return data.jobs ?? [];
  }

  async function loadLeads() {
    setIsLoadingLeads(true);
    setLeadsError(null);

    try {
      const nextLeads = await fetchLeadsFromApi();
      setLeads(nextLeads);
      return nextLeads;
    } catch {
      setLeadsError("Failed to load leads. Please try again.");
      return [];
    } finally {
      setIsLoadingLeads(false);
    }
  }

  async function loadJobs(leadId: string | null) {
    if (!leadId) {
      setJobs([]);
      return;
    }

    setIsLoadingJobs(true);
    setJobsError(null);

    try {
      const nextJobs = await fetchJobsFromApi(leadId);
      setJobs(nextJobs);
    } catch {
      setJobsError("Failed to load jobs. Please try again.");
    } finally {
      setIsLoadingJobs(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const nextLeads = await fetchLeadsFromApi();

        if (!isMounted) return;

        setLeads(nextLeads);

        const firstLeadId = nextLeads[0]?.id ?? null;
        setSelectedLeadId(firstLeadId);

        if (firstLeadId) {
          setIsLoadingJobs(true);

          const nextJobs = await fetchJobsFromApi(firstLeadId);

          if (isMounted) {
            setJobs(nextJobs);
          }
        }
      } catch {
        if (isMounted) {
          setLeadsError("Failed to load dashboard data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingLeads(false);
          setIsLoadingJobs(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSelectLead(leadId: string) {
    setSelectedLeadId(leadId);
    setActionMessage(null);
    setActionError(null);

    await loadJobs(leadId);
  }

  async function handleStatusChange(
    jobId: string,
    status: JobStatus,
    cancellationReason?: string,
  ) {
    setUpdatingJobId(jobId);
    setActionMessage(null);
    setActionError(null);

    const toastId = toast.loading("Updating job status...");

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          cancellationReason,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to update job status");
      }

      toast.success("Status updated and automations triggered.", {
        id: toastId,
      });

      setActionMessage("Status updated and automations were triggered.");
      await loadJobs(selectedLeadId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update status. Please try again.";

      toast.error(message, {
        id: toastId,
      });

      setActionError(message);
    } finally {
      setUpdatingJobId(null);
    }
  }

  async function handleDeleteJob(jobId: string) {
    setUpdatingJobId(jobId);
    setActionMessage(null);
    setActionError(null);

    const toastId = toast.loading("Deleting job...");

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Failed to delete job");
      }

      const sheetsOk = data?.googleSheetsResult?.ok;

      toast.success(
        sheetsOk
          ? "Job deleted from database and Google Sheets."
          : "Job deleted from database. Google Sheets sync was skipped or failed.",
        {
          id: toastId,
        },
      );

      setActionMessage(
        sheetsOk
          ? "Job deleted from database and Google Sheets."
          : "Job deleted from database. Google Sheets sync was skipped or failed.",
      );

      await loadJobs(selectedLeadId);
      await loadLeads();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete job. Please try again.";

      toast.error(message, {
        id: toastId,
      });

      setActionError(message);
    } finally {
      setUpdatingJobId(null);
    }
  }

  return {
    leads,
    selectedLeadId,
    selectedLead,
    jobs,
    allEvents,

    isCreateLeadOpen,
    setIsCreateLeadOpen,
    isCreateJobOpen,
    setIsCreateJobOpen,

    isLoadingLeads,
    isLoadingJobs,

    leadsError,
    jobsError,
    actionMessage,
    actionError,

    updatingJobId,

    loadLeads,
    loadJobs,
    setSelectedLeadId,
    setActionMessage,
    setActionError,
    handleDeleteJob,

    handleSelectLead,
    handleStatusChange,
  };
}
