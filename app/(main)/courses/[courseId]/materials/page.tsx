'use client'
import { useClassroomStore } from "@/store/classroom-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Download, Minus, Plus } from "lucide-react";
import { useParams } from 'next/navigation';
import { useState } from 'react';
import MaterialList from './components/MaterialList'
import Link from "next/link";
import { toast } from "sonner"; // ✅ Sonner
import Hint from "@/components/Hint";

const Materials = () => {
  const { courseId } = useParams();
  const [authId, setAuthId] = useState(0);
  const { getMaterialsByCourseId, isLoading } = useClassroomStore();
  const courseMaterials = getMaterialsByCourseId(courseId as string);
  const downloadFile = (fileId: string) => {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}&authuser=${authId}`;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000); // 5 seconds
  };

  const onDownloadAll = () => {
    alert("Open a new tab or minimize this, it make take more than a minute, let us handle that and you can chill!")
    const fileIds = courseMaterials
      .map((material) => material.materials?.[0]?.driveFile?.driveFile?.id)
      .filter((id): id is string => Boolean(id));

    if (!fileIds.length) {
      toast.error("No files available for download");
      return;
    }

    let current = 0;
    const total = fileIds.length;
    const toastId = toast.loading("Preparing downloads...");

    const downloadNext = () => {
      if (current >= total) {
        // Dismiss the loading toast and show success
        toast.dismiss(toastId);
        toast.success("Done!");
        return;
      }

      const fileId = fileIds[current];

      // Update the existing toast with new message
      toast.loading(`⬇️ Downloading file ${current + 1} of ${total}...`, {
        id: toastId,
      });

      downloadFile(fileId);
      current++;
      setTimeout(downloadNext, 7000);
    };

    setTimeout(downloadNext, 1500);
  };


  if (isLoading) {
    return <p>Loading materials...</p>;
  }

  if (!courseMaterials || courseMaterials.length === 0) {
    return (
      <div className="space-y-4 p-6">
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
          <div className="flex gap-1 items-center">
            <Hint label="This should match the Google account currently signed in your browser to access shared files.">
              <span className="text-md">Authentication Id &nbsp;&nbsp;</span>
            </Hint>

            <Button
              onClick={() => {
                if (authId === 0) return;
                setAuthId((prev) => prev - 1)
              }}
              variant={"outline"} size={"icon"}>
              <Minus />
            </Button>
            <Button variant={"outline"} size={"icon"}>
              {authId}
            </Button>
            <Button
              onClick={() => {
                if (authId === 10) return;
                setAuthId((prev) => prev + 1)
              }}
              variant={"outline"} size={"icon"}>
              <Plus />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onDownloadAll}
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Download All
          </Button>
        </div>
      </div>

      {/* Material List */}
      <MaterialList materials={courseMaterials} authId={authId} />
    </div>
  );
};

export default Materials;
