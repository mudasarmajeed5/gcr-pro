"use client";
import React, { useState, useCallback, useEffect } from "react";
import { usePreviewStore } from "@/store/preview-store";
import { useParams } from "next/navigation";
import { useClassroomStore } from "@/store/classroom-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Material } from "@/types/all-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Youtube, Calendar, Clock, User, BookOpen, ArrowLeft, LinkIcon } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
const ViewAssignment = () => {
  const [instructions,setInstructions] = useState('')
  const { assignmentId } = useParams();
  const { getAssignmentById, getCourseById } = useClassroomStore();
  const { openPreview } = usePreviewStore();
  const [assignment, setAssignment] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const course = assignment ? getCourseById(assignment.courseId) : null;
  const [isSolving, setIsSolving] = useState(false);
  const [solveError, setSolveError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch assignment and metadata
  const fetchAssignment = useCallback(async () => {
    const local = getAssignmentById(assignmentId as string);
    setAssignment(local);
    // Fetch metadata from backend
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/check`);
      if (res.ok) {
        setMetadata(await res.json());
      }
    } catch { }
  }, [assignmentId, getAssignmentById]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  // Solve assignment handler
  // Drag-and-drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a .docx file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file)
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      alert('Please select a .docx file');
    }
  };

  const handleSolve = async () => {
    if (!selectedFile) return;
    setIsSolving(true);
    setSolveError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileId', assignmentId as string);
      formData.append("instructions", instructions)
      const response = await fetch('/api/assignments/solve', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Solving failed' }));
        throw new Error(errorData.error || 'Solving failed');
      }
      // Optionally refetch assignment or show success
      fetchAssignment();
      setSelectedFile(null);
    } catch (err: any) {
      setSolveError(err.message || 'Failed to solve assignment');
    } finally {
      setIsSolving(false);
    }
  };


  // Download solved assignment handler
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/download`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = assignment?.originalName ? `solved_${assignment.originalName}` : 'solved_assignment.docx';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
      <div className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/assignments">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-50/10 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
            </Link>
            <div className="w-8 h-8 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-medium truncate">{course?.name || "Course"}</h1>
              <p className="text-xs text-muted-foreground truncate">{course?.section}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-4xl">
        <Card className="mb-4 sm:mb-6 shadow-sm">
          <CardHeader className="border-b p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
              <div className="flex-1 space-y-2">
                <CardTitle className="text-base sm:text-xl leading-tight pr-2">
                  {assignment.title}
                </CardTitle>

                {/* Mobile-first due date layout */}
                <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  {assignment.dueDate && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Due {formatDueDate()}</span>
                      </div>
                      {assignment.dueTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDueTime()}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {assignment.maxPoints && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{assignment.maxPoints} points</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge positioning for mobile */}
              <div className="flex justify-start sm:justify-end">
                <Badge variant={getStatusVariant(assignment.submissionState)} className="text-xs">
                  {getStatusText(assignment.submissionState)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* Status Section - Better mobile layout */}
            <div className="mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base">Your work</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {isSubmitted ? "Submitted" : "Not submitted"}
                      {assignment.late && <span className="text-destructive ml-1">(Late)</span>}
                    </p>
                  </div>
                </div>

                {assignment.assignedGrade !== undefined && (
                  <div className="text-left sm:text-right pl-13 sm:pl-0">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {assignment.assignedGrade}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      out of {assignment.maxPoints || "ungraded"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Solver Section with conditional rendering */}
            <div className="mb-6">
              {metadata?.status === 'solved' && metadata?.hasSolvedFile ? (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${isDownloading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white ml-2`}
                >
                  {isDownloading ? (
                    <>
                      <span className="inline-block w-4 h-4 bborder-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Download Solution</span>
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <FileText className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop your .docx material here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Or click to browse
                    </p>
                    <Input
                      type="file"
                      accept=".docx"
                      onChange={handleFileSelect}
                      id="file-input"
                      disabled={isSolving}
                    />
                    {selectedFile && (
                      <div className="mt-4 text-sm text-gray-700">
                        Selected: {selectedFile.name}
                      </div>
                    )}
                  </div>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Enter specific instructions for solving the assignment (optional)"
                    className="my-2"

                  />

                  <button
                    onClick={handleSolve}
                    disabled={!selectedFile || isSolving}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${isSolving || !selectedFile ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
                  >
                    {isSolving ? (
                        <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Solving...
                        </>
                    ) : (
                      <>
                        <span className="mr-2">Solve with AI</span>
                      </>
                    )}
                  </button>
                  {solveError && (
                    <div className="mt-2 text-red-600 text-sm">{solveError}</div>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Materials Section - Enhanced mobile layout */}
            {assignment.materials && assignment.materials.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Materials
                  <span className="text-xs text-muted-foreground ml-1">
                    ({assignment.materials.length})
                  </span>
                </h3>

                <div className="space-y-2 sm:space-y-3">
                  {assignment.materials.map((material: Material, idx: number) => (
                    <div
                      key={idx}
                      className="border rounded-lg hover:bg-muted/50 transition-colors active:scale-[0.98] sm:active:scale-100"
                    >
                      {/* Google Drive */}
                      {material.driveFile && (
                        <div
                          className="flex items-center gap-3 p-3 sm:p-4 text-foreground hover:text-primary cursor-pointer min-h-[60px]"
                          onClick={() =>
                            openPreview({
                              title: material.driveFile?.driveFile?.title ?? "",
                              type: "driveFile",
                              url: material.driveFile?.driveFile?.alternateLink ?? "",
                              driveFileId: material.driveFile?.driveFile?.id ?? "",
                            })
                          }
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm sm:text-base line-clamp-2">
                              {material.driveFile.driveFile.title}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Google Drive file
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Link */}
                      {material.link && (
                        <a
                          href={material.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 sm:p-4 text-foreground hover:text-primary min-h-[60px]"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm sm:text-base line-clamp-2">
                              {material.link.title}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Link</p>
                          </div>
                        </a>
                      )}

                      {/* YouTube */}
                      {material.youtubeVideo && (
                        <a
                          href={material.youtubeVideo.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 sm:p-4 text-foreground hover:text-primary min-h-[60px]"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm sm:text-base line-clamp-2">
                              {material.youtubeVideo.title}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              YouTube video
                            </p>
                          </div>
                        </a>
                      )}

                      {/* Form */}
                      {material.form && (
                        <a
                          href={material.form.formUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 sm:p-4 text-foreground hover:text-primary min-h-[60px]"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-sm sm:text-base line-clamp-2">
                              {material.form.title}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Google Form
                            </p>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 opacity-50" />
                </div>
                <p className="text-sm sm:text-base font-medium mb-1">No materials yet</p>
                <p className="text-xs sm:text-sm opacity-75">
                  Materials will appear here when added
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>

  );
};

export default ViewAssignment;