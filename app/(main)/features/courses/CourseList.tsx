"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, ExternalLink, MapPin, Users } from "lucide-react";
import { CourseCardSkeleton } from "./CourseSkeleton";
import { useClassroomStore } from "@/store/classroom-store";

export default function CoursesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { courses, isLoading, error, fetchClassroomData, refreshData } = useClassroomStore();
  const handleRefresh = async () => {
    try {
      await refreshData();
      console.log("Data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchClassroomData();
    }
  }, [status, fetchClassroomData]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">Please sign in to view your courses.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage and access your Google Classroom courses
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      ) : courses.length === 0 && !error ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                You dont have any courses available at the moment.
              </p>
              <Button onClick={() => { }} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="cursor-pointer transition-all hover:shadow-lg group"
              onClick={() => handleCourseClick(course.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {course.name}
                </CardTitle>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {course.section && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Section: {course.section}</span>
                    </div>
                  )}
                  {course.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Room: {course.room}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {course.descriptionHeading && (
                    <div>
                      <h4 className="font-medium text-foreground">
                        {course.descriptionHeading}
                      </h4>
                    </div>
                  )}

                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.courseState === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {course.courseState}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={course.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in GCR
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}