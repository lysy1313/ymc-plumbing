import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Skeleton";

export function JobsPanelSkeleton() {
  return (
    <div>
      <div className="mb-4">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-6 w-56" />
                <Skeleton className="mt-2 h-4 w-72 max-w-full" />
              </div>

              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
