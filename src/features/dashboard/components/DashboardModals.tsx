import { Modal } from "@/shared/components/Modal";
import { CreateLeadForm } from "@/features/leads/components/CreateLeadForm";
import { CreateJobForm } from "@/features/jobs/components/CreateJobForm";
import { type Lead } from "@/features/leads/types/lead.types";

type DashboardModalsProps = {
  dashboard: {
    isCreateLeadOpen: boolean;
    setIsCreateLeadOpen: (value: boolean) => void;

    isCreateJobOpen: boolean;
    setIsCreateJobOpen: (value: boolean) => void;

    selectedLead: Lead | null;

    setSelectedLeadId: (value: string | null) => void;
    setActionMessage: (value: string | null) => void;
    setActionError: (value: string | null) => void;

    loadLeads: () => Promise<Lead[]>;
    loadJobs: (leadId: string | null) => Promise<void>;
  };
};

export function DashboardModals({ dashboard }: DashboardModalsProps) {
  return (
    <>
      <Modal
        isOpen={dashboard.isCreateLeadOpen}
        title="Add lead"
        description="Create a new incoming client request."
        onClose={() => dashboard.setIsCreateLeadOpen(false)}
      >
        <CreateLeadForm
          onCancel={() => dashboard.setIsCreateLeadOpen(false)}
          onSuccess={async (lead) => {
            dashboard.setIsCreateLeadOpen(false);
            dashboard.setSelectedLeadId(lead.id);
            dashboard.setActionMessage("Lead created successfully.");
            dashboard.setActionError(null);

            await dashboard.loadLeads();
            await dashboard.loadJobs(lead.id);
          }}
        />
      </Modal>

      <Modal
        isOpen={dashboard.isCreateJobOpen}
        title="Create a job"
        description="Fill in client, job, location and schedule details."
        onClose={() => dashboard.setIsCreateJobOpen(false)}
      >
        {dashboard.selectedLead ? (
          <CreateJobForm
            lead={dashboard.selectedLead}
            onCancel={() => dashboard.setIsCreateJobOpen(false)}
            onSuccess={async () => {
              dashboard.setIsCreateJobOpen(false);
              dashboard.setActionMessage(
                "Job created and automations were triggered.",
              );
              dashboard.setActionError(null);

              await dashboard.loadJobs(dashboard.selectedLead?.id ?? null);
              await dashboard.loadLeads();
            }}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Select a lead before creating a job.
          </p>
        )}
      </Modal>
    </>
  );
}
