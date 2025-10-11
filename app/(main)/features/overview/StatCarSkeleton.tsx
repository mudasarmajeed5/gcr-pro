// Enhanced skeleton for stat cards
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StatCardSkeleton = () => (
  <Card className="border-border/50 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      {/* Title placeholder */}
      <Skeleton className="h-4 w-24" />
      {/* Icon placeholder */}
      <Skeleton className="h-5 w-5 rounded-full" />
    </CardHeader>

    <CardContent>
      {/* Big number */}
      <Skeleton className="h-14 w-20 mb-3" />

      {/* Progress bar placeholder */}
      <Skeleton className="h-2 w-full rounded-full mb-3" />

      {/* Bottom text + button row */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardContent>
  </Card>
);
