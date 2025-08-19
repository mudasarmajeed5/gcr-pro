"use client";
import { usePreviewStore } from "@/store/preview-store";
import { useParams } from "next/navigation";
import { useClassroomStore } from "@/store/classroom-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Link, Youtube, Calendar, Clock, User, BookOpen } from "lucide-react";

const ViewAssignment = () => {
  const { assignmentId } = useParams();
  const { getAssignmentById, getCourseById } = useClassroomStore();
  const { openPreview } = usePreviewStore();
  const assignment = getAssignmentById(assignmentId as string);
  const course = assignment ? getCourseById(assignment.courseId) : null;

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Assignment not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatDueDate = () => {
    if (!assignment.dueDate) return null;
    const date = new Date(
      assignment.dueDate.year,
      assignment.dueDate.month - 1,
      assignment.dueDate.day
    );
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDueTime = () => {
    if (!assignment.dueTime) return null;
    return `${assignment.dueTime.hours}:${assignment.dueTime.minutes.toString().padStart(2, '0')}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'TURNED_IN': return 'default';
      case 'RETURNED': return 'secondary';
      case 'NEW':
      case 'CREATED': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TURNED_IN': return 'Submitted';
      case 'RETURNED': return 'Graded';
      case 'NEW':
      case 'CREATED': return 'Assigned';
      default: return status;
    }
  };

  // Fix: Check submission state correctly
  const isSubmitted = assignment.submissionState === 'TURNED_IN' || assignment.submissionState === 'RETURNED';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-medium">{course?.name || 'Course'}</h1>
              <p className="text-sm text-muted-foreground">{course?.section}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {assignment.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due {formatDueDate()}</span>
                      {assignment.dueTime && (
                        <>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{formatDueTime()}</span>
                        </>
                      )}
                    </div>
                  )}
                  {assignment.maxPoints && (
                    <span>{assignment.maxPoints} points</span>
                  )}
                </div>
              </div>
              <Badge variant={getStatusVariant(assignment.submissionState)}>
                {getStatusText(assignment.submissionState)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Status Section - FIXED: Check submission state correctly */}
            <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Your work</p>
                  <p className="text-sm text-muted-foreground">
                    {isSubmitted ? 'Submitted' : 'Not submitted'}
                    {assignment.late && <span className="text-destructive ml-2">(Late)</span>}
                  </p>
                </div>
              </div>
              {assignment.assignedGrade !== undefined && (
                <div className="text-right">
                  <p className="text-2xl font-semibold">{assignment.assignedGrade}</p>
                  <p className="text-sm text-muted-foreground">
                    out of {assignment.maxPoints || 'ungraded'}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Materials Section */}
            {assignment.materials && assignment.materials.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Materials
                </h3>
                <div className="grid gap-3">
                  {assignment.materials.map((material: any, idx: number) => (
                    <div key={idx} className="border rounded-lg hover:bg-muted/50 transition-colors">
                      {material.driveFile && (
                        <div
                          className="flex items-center gap-3 p-4 text-foreground hover:text-primary cursor-pointer"
                          onClick={() => openPreview({
                            title: material.driveFile.driveFile.title,
                            type: 'driveFile',
                            url: material.driveFile.driveFile.alternateLink,
                            driveFileId: material.driveFile.driveFile.id
                          })}
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.driveFile.driveFile.title}</p>
                            <p className="text-sm text-muted-foreground">Google Drive file</p>
                          </div>
                        </div>
                      )}

                      {material.link && (
                        <a
                          href={material.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 text-foreground hover:text-primary"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Link className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.link.title}</p>
                            <p className="text-sm text-muted-foreground">Link</p>
                          </div>
                        </a>
                      )}

                      {material.youtubeVideo && (
                        <a
                          href={material.youtubeVideo.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 text-foreground hover:text-primary"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Youtube className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.youtubeVideo.title}</p>
                            <p className="text-sm text-muted-foreground">YouTube video</p>
                          </div>
                        </a>
                      )}

                      {material.form && (
                        <a
                          href={material.form.formUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 text-foreground hover:text-primary"
                        >
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.form.title}</p>
                            <p className="text-sm text-muted-foreground">Google Form</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No materials attached to this assignment</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              {isSubmitted ? (
                <>
                  <Button variant="outline" className="flex-1">View Submission</Button>
                  <Button variant="outline" className="flex-1">Unsubmit</Button>
                </>
              ) : (
                <>
                  <Button className="flex-1">Turn in</Button>
                  <Button variant="outline" className="flex-1">Mark as done</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewAssignment;