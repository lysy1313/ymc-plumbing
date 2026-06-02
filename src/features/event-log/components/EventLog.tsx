import { Card } from "@/shared/components/Card";

type EventLogItem = {
  id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
};

type EventLogProps = {
  events: EventLogItem[];
};

export function EventLog({ events }: EventLogProps) {
  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-slate-950">
        Automation event log
      </h3>

      {events.length === 0 ? (
        <p className="text-sm text-slate-500">No events yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">
                  {event.message}
                </p>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  {event.status}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
