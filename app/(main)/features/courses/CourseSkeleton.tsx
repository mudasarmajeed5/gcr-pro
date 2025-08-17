
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export const CourseCardSkeleton = () => (


    <Card className="w-full">
        <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>
        </CardContent>
    </Card>
);