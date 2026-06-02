import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Lead } from "../types/lead.types";

type LeadCardProps = {
  lead: Lead;
  onCreateJob: () => void;
};

export function LeadCard({ lead, onCreateJob }: LeadCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            New Lead
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {lead.firstName} {lead.lastName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{lead.source}</p>
        </div>

        <Button onClick={onCreateJob}>Create Job</Button>
      </div>

      <div className="space-y-2 text-sm text-slate-700">
        <p>
          <strong>Phone:</strong> {lead.phone}
        </p>
        <p>
          <strong>Email:</strong> {lead.email}
        </p>
        <p>
          <strong>Issue:</strong> {lead.issue}
        </p>
        <p>
          <strong>Location:</strong> {lead.address}, {lead.city}, {lead.zipCode}
        </p>
      </div>
    </Card>
  );
}
