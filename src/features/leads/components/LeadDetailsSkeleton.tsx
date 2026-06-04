import { Card } from "@/shared/components/Card";
import { Skeleton } from "@/shared/components/Skeleton";

export function LeadDetailsSkeleton() {
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-7 w-44" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>

        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full md:col-span-2" />
        <Skeleton className="h-16 w-full md:col-span-2" />
      </div>
    </Card>
  );
}
