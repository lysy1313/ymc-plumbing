import { Card } from "@/shared/components/Card";
import { type EventLogItem } from "@/features/event-log/types/event-log.types";

type EventLogProps = {
  events: EventLogItem[];
};

const EVENT_STATUS_CLASSES: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  ERROR: "bg-red-100 text-red-700",
  SKIPPED: "bg-slate-200 text-slate-700",
};

function formatEventMessage(message: string, maxLength = 140) {
  if (message.length <= maxLength) {
    return message;
  }

  return `${message.slice(0, maxLength)}...`;
}

export function EventLog({ events }: EventLogProps) {
  return (
    <Card className="sticky top-16 max-h-[calc(100vh-96px)] overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-950">
          Automation event log
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Latest system actions for selected lead jobs.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No automation events yet.
        </div>
      ) : (
        <div className="max-h-[calc(100vh-190px)] space-y-3 overflow-y-auto pr-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span
                  className="max-w-[180px] truncate rounded-md bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700"
                  title={event.type}
                >
                  {event.type}
                </span>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    EVENT_STATUS_CLASSES[event.status] ??
                    "bg-slate-200 text-slate-700"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <p
                className="break-words text-sm font-medium leading-5 text-slate-900"
                title={event.message}
              >
                {formatEventMessage(event.message)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
