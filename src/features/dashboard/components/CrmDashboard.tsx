"use client";

import { LeadsList } from "@/features/leads/components/LeadsList";
import { LeadDetailsCard } from "@/features/leads/components/LeadDetailsCard";
import { EventLog } from "@/features/event-log/components/EventLog";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardModals } from "./DashboardModals";
import { DashboardAlerts } from "./DashboardAlerts";
import { JobsPanel } from "./JobsPanel";
import { useCrmDashboard } from "../hooks/useCrmDashboard";

export function CrmDashboard() {
  const dashboard = useCrmDashboard();

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <DashboardModals dashboard={dashboard} />

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-5 xl:grid-cols-[360px_1fr_420px]">
        <div className="space-y-6">
          {dashboard.leadsError ? (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {dashboard.leadsError}
            </div>
          ) : null}

          {dashboard.isLoadingLeads ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              Loading leads...
            </div>
          ) : (
            <LeadsList
              leads={dashboard.leads}
              selectedLeadId={dashboard.selectedLeadId}
              onSelectLead={dashboard.handleSelectLead}
              onAddLead={() => dashboard.setIsCreateLeadOpen(true)}
            />
          )}
        </div>

        <div className="space-y-6">
          <LeadDetailsCard
            lead={dashboard.selectedLead}
            onCreateJob={() => dashboard.setIsCreateJobOpen(true)}
          />

          <DashboardAlerts
            actionMessage={dashboard.actionMessage}
            actionError={dashboard.actionError}
            jobsError={dashboard.jobsError}
          />

          <JobsPanel
            selectedLead={dashboard.selectedLead}
            jobs={dashboard.jobs}
            isLoadingJobs={dashboard.isLoadingJobs}
            updatingJobId={dashboard.updatingJobId}
            onChangeStatus={dashboard.handleStatusChange}
          />
        </div>

        <aside className="min-w-0">
          <EventLog events={dashboard.allEvents} />
        </aside>
      </section>
    </main>
  );
}
