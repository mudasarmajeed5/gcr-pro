"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";



import {
  CheckCircle,
  Clock,
  XCircle,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton } from "./StatCarSkeleton";

interface Assignment {
  id: string;
  title: string;
  dueDate?: string;
  maxPoints?: number;
  assignedGrade?: number;
  submissionState: 'TURNED_IN' | 'NEW' | 'CREATED' | 'RECLAIMED_BY_STUDENT';
  late: boolean;
}

interface AssignmentsStats {
  totalAssignments: number;
  turnedIn: number;
  unsubmitted: number;
  missed: number;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
}

export default function AssignmentsOverview() {
  const router = useRouter();
  const handleViewDetails = (filter: 'turnedIn' | 'unsubmitted' | 'missed' | 'graded') => {
    router.push(`/assignments?filter=${filter}`);
  };
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AssignmentsStats>({
    totalAssignments: 0,
    turnedIn: 0,
    unsubmitted: 0,
    missed: 0,
    totalPoints: 0,
    earnedPoints: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignmentsStats = async () => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assignments/stats");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assignments stats");
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAssignmentsStats();
    }
  }, [status]);

  if (!session) {
    return null; // Don't show anything if not authenticated
  }

  if (error) {
    return (
      <div className="mb-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mb-8 p-5">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Your academic performance at a glance
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3 mx-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mx-auto">
          {/* Overall Grade Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Grade
              </CardTitle>
              <Target className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-3">
                {stats.percentage.toFixed(1)}%
              </div>
              <div className="mb-3">
                <Progress
                  value={stats.percentage}
                  className="h-2"
                />
              </div>
              <p className="text-sm flex justify-between items-center text-muted-foreground">
                <span>
                  <span className="text-blue-600 font-medium">{stats.earnedPoints}</span> / <span className="text-blue-600 font-medium">{stats.totalPoints}</span> points earned
                </span>
                <Button
                  variant="link"
                  className="p-0 text-sm"
                  onClick={() => handleViewDetails('graded')}
                >
                  View Details
                </Button>
              </p>
            </CardContent>
          </Card>

          {/* Turned In Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Turned In
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-3">
                {stats.turnedIn}
              </div>
              <div className="py-2 bg-transparent">
              </div>
              <p className="text-sm flex justify-between items-center text-muted-foreground">
                {stats.totalAssignments > 0
                  ? (
                    <>
                      <span>
                        <span className="text-green-600 font-medium">
                          {((stats.turnedIn / stats.totalAssignments) * 100).toFixed(1)}%
                        </span> of assignments completed
                      </span>
                      <Button
                        variant="link"
                        className="p-0 text-sm"
                        onClick={() => handleViewDetails('turnedIn')}
                      >
                        View Details
                      </Button>
                    </>
                  )
                  : 'No assignments yet'
                }
              </p>
            </CardContent>
          </Card>

          {/* Unsubmitted Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unsubmitted
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-3">
                {stats.unsubmitted}
              </div>
              <div className="py-2 bg-transparent">
              </div>
              <p className="text-sm text-muted-foreground flex justify-between items-center">
                {stats.unsubmitted > 0
                  ? (
                    <>
                      <span>
                        <span className="text-orange-600 font-medium">{stats.unsubmitted}</span> assignments pending</span>
                      <Button
                        variant="link"
                        className="p-0 text-sm"
                        onClick={() => handleViewDetails('unsubmitted')}
                      >
                        View Details
                      </Button>
                    </>
                  )
                  : 'All caught up!'
                }
              </p>

            </CardContent>
          </Card>

          {/* Missed Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Missed
              </CardTitle>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-3">
                {stats.missed}
              </div>
              <p className="text-sm flex justify-between items-center text-muted-foreground">
                {stats.missed > 0
                  ? (
                    <>
                      <span>
                        <span className="text-red-600 font-medium">{stats.missed}</span> overdue assignments
                      </span>
                      <Button
                        variant="link"
                        className="p-0 text-sm"
                        onClick={() => handleViewDetails('missed')}
                      >
                        View Details
                      </Button>
                    </>
                  )
                  : 'No missed work'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}