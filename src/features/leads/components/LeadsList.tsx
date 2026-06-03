import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Lead } from "../types/lead.types";

type LeadsListProps = {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onAddLead: () => void;
};

export function LeadsList({
  leads,
  selectedLeadId,
  onSelectLead,
  onAddLead,
}: LeadsListProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Leads</h2>
          <p className="text-sm text-slate-500">Incoming client requests</p>
        </div>

        <Button type="button" onClick={onAddLead}>
          Add Lead
        </Button>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-slate-500">No leads yet.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const isSelected = lead.id === selectedLeadId;

            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => onSelectLead(lead.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-950">
                      {lead.firstName} {lead.lastName}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {lead.source} · {lead.city}
                    </p>

                    <p className="mt-2 line-clamp-2 break-words text-sm text-slate-700">
                      {lead.issue}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                    {lead._count?.jobs ?? 0} jobs
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
