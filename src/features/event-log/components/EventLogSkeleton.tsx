import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Skeleton";

export function EventLogSkeleton() {
  return (
    <Card className="sticky top-16 max-h-[calc(100vh-96px)] overflow-hidden">
      <div className="mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>
    </Card>
  );
}
