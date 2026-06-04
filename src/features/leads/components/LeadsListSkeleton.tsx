import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Skeleton";

export function LeadsListSkeleton() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-2 h-4 w-36" />
        </div>

        <Skeleton className="h-9 w-20" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-40" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>

              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
