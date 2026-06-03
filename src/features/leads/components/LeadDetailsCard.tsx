import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Lead } from "../types/lead.types";

type LeadDetailsCardProps = {
  lead: Lead | null;
  onCreateJob: () => void;
};

export function LeadDetailsCard({ lead, onCreateJob }: LeadDetailsCardProps) {
  if (!lead) {
    return (
      <Card>
        <p className="text-sm text-slate-500">
          Select a lead to view details and create a job.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Selected Lead
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {lead.firstName} {lead.lastName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{lead.source}</p>
        </div>

        <Button type="button" onClick={onCreateJob}>
          Create Job
        </Button>
      </div>

      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <p className="min-w-0">
          <span className="block text-xs text-slate-500">Phone</span>
          <strong className="break-words">{lead.phone}</strong>
        </p>

        <p className="min-w-0">
          <span className="block text-xs text-slate-500">Email</span>
          <strong className="break-words">{lead.email || "—"}</strong>
        </p>

        <p className="min-w-0 md:col-span-2">
          <span className="block text-xs text-slate-500">Issue</span>
          <strong className="break-words">{lead.issue}</strong>
        </p>

        <p className="min-w-0 md:col-span-2">
          <span className="block text-xs text-slate-500">Location</span>
          <strong className="break-words">
            {lead.address}, {lead.city}, {lead.zipCode}
          </strong>
        </p>
      </div>
    </Card>
  );
}
