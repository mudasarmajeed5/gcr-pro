"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useClassroomStore } from "@/store/classroom-store";

import {
  CheckCircle,
  Clock,
  XCircle,
  Target,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton } from "./StatCarSkeleton";
import { userStore } from "@/store/user-store"
import { getSettings } from "@/actions/get-settings";
export default function AssignmentsOverview() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showGradeCard, isLoaded, setShowGradeCard, setSmtpPassword } = userStore();
  // Get data and actions from the store
  const {
    stats,
    isLoading,
    error,
    fetchClassroomData,
    refreshData,
    shouldRefresh,
  } = useClassroomStore();

  const handleViewDetails = (filter: 'turnedIn' | 'unsubmitted' | 'missed' | 'graded') => {
    router.push(`/assignments?filter=${filter}`);
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      console.log("Data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };
  const initalizeSettings = async () => {
    console.log("Function called")
    if(isLoaded){
      console.log("Returning cause data is loaded")
      return;
    }
    const result = await getSettings();
    if(result.success){
      setShowGradeCard(result.message.showGradeCard)
      setSmtpPassword(result.message.smtpPassword)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchClassroomData();
    }
  }, [status, fetchClassroomData]);
  useEffect(() => {
    if (status === "authenticated" && !isLoaded) {
      initalizeSettings()
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && shouldRefresh()) {
      console.log("Data is stale, refreshing...");
      fetchClassroomData();
    }
  }, [status, shouldRefresh, fetchClassroomData]);

  if (!session) {
    return null; 
  }

  if (error) {
    return (
      <div className="mb-6 p-5">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use default stats if none available
  const displayStats = stats || {
    totalAssignments: 0,
    turnedIn: 0,
    unsubmitted: 0,
    missed: 0,
    totalPoints: 0,
    earnedPoints: 0,
    percentage: 0
  };

  return (
    <div className="mb-8 p-5 min-h-fit">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Your academic performance at a glance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden xl:inline-block">
            Refresh
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid xl:grid-cols-3 gap-3 mx-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid xl:grid-cols-3 gap-3 mx-auto">
          {
            showGradeCard && <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall Grade
                </CardTitle>
                <Target className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-3">
                  {displayStats.percentage.toFixed(1)}%
                </div>
                <div className="mb-3">
                  <Progress
                    value={displayStats.percentage}
                    className="h-2"
                  />
                </div>
                <p className="text-sm flex justify-between items-center text-muted-foreground">
                  <span>
                    <span className="text-blue-600 font-medium">{displayStats.earnedPoints}</span> / <span className="text-blue-600 font-medium">{displayStats.totalPoints}</span> points earned
                  </span>
                  <Button
                    variant="link"
                    className="p-0 text-sm cursor-pointer"
                    onClick={() => handleViewDetails('graded')}
                  >
                    View Details
                  </Button>
                </p>
              </CardContent>
            </Card>
          }

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
                {displayStats.turnedIn}
              </div>
              <div className="mb-3">
                <Progress
                  value={((displayStats.turnedIn / displayStats.totalAssignments) * 100)}
                  className="h-2"
                />
              </div>
              <p className="text-sm flex justify-between items-center text-muted-foreground">
                {displayStats.totalAssignments > 0
                  ? (
                    <>
                      <span>
                        <span className="text-green-600 font-medium">
                          {((displayStats.turnedIn / displayStats.totalAssignments) * 100).toFixed(1)}%
                        </span> of assignments completed
                      </span>
                      <Button
                        variant="link"
                        className="p-0 text-sm cursor-pointer"
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
                {displayStats.unsubmitted}
              </div>
              <div className="py-2 bg-transparent">
              </div>
              <p className="text-sm text-muted-foreground flex justify-between items-center">
                {displayStats.unsubmitted > 0
                  ? (
                    <>
                      <span>
                        <span className="text-orange-600 font-medium">{displayStats.unsubmitted}</span> assignments pending</span>
                      <Button
                        variant="link"
                        className="p-0 text-sm cursor-pointer"
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
                {displayStats.missed}
              </div>
              <div className="py-2 bg-transparent">
              </div>
              <p className="text-sm flex justify-between items-center text-muted-foreground">
                {displayStats.missed > 0
                  ? (
                    <>
                      <span>
                        <span className="text-red-600 font-medium">{displayStats.missed}</span> overdue assignments
                      </span>
                      <Button
                        variant="link"
                        className="p-0 text-sm cursor-pointer"
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