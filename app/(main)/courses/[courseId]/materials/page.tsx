'use client'
import { useClassroomStore } from "@/store/classroom-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import { useParams } from 'next/navigation';
import { useState } from 'react';
import MaterialList from './components/MaterialList'
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { handleDownloadAll } from './helpers/handle-download-all';
import Link from "next/link";

const Materials = () => {
  const { courseId } = useParams();
  const { getMaterialsByCourseId, isLoading } = useClassroomStore();
  const courseMaterials = getMaterialsByCourseId(courseId as string);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const onDownloadAll = async () => {
    if (isDownloading) return;

    const result = await handleDownloadAll(
      courseMaterials,
      setDownloadProgress,
      setIsDownloading
    );

    // Show final result with one toast
    if (result.failed === 0) {
      toast.success(`Successfully downloaded ${result.successful} files!`);
    } else {
      toast.warning(
        `Download completed: ${result.successful} successful, ${result.failed} failed. Some files were opened in new tabs.`
      );
    }

    // Reset progress after a delay
    setTimeout(() => setDownloadProgress(0), 2000);
  };

  if (isLoading) {
    return <p>Loading materials...</p>;
  }

  if (!courseMaterials || courseMaterials.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-3xl font-semibold">Course Materials</h2>
        </div>
        <p className="text-muted-foreground">No materials found for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <Link href={`/courses/${courseId}`}>
        <Button variant="ghost" className="w-fit flex items-center gap-2">
          <ArrowLeft /> <span>Back to Course</span>
        </Button>
      </Link>
      <div className="flex items-center mt-5 justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-10 w-10" />
          <h2 className="text-2xl font-semibold">Course Materials</h2>
          <Badge variant="secondary">
            {courseMaterials.length} {courseMaterials.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          {isDownloading && (
            <div className="w-32">
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}
          <Button
            variant="outline"
            onClick={onDownloadAll}
            size="sm"
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-1" />
            Download All
          </Button>
        </div>
      </div>

      {/* Material List */}
      <MaterialList materials={courseMaterials} />
    </div>
  );
};

export default Materials;