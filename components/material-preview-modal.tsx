// components/material-preview-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreviewStore } from "@/store/preview-store";

export const MaterialPreviewModal = () => {
  const { previewMaterial, closePreview } = usePreviewStore();

  if (!previewMaterial) return null;

  return (
    <Dialog
      open={!!previewMaterial}
      onOpenChange={(open) => !open && closePreview()}
    >
      <DialogContent
        className="
          h-[100dvh] w-screen max-w-none sm:max-w-full max-h-none rounded-none p-0
          pt-[env(safe-area-inset-top)] 
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            {previewMaterial.title}
          </DialogTitle>
          {/* You can add your close button here */}
        </DialogHeader>

        <div className="h-[calc(100dvh-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
          {previewMaterial.type === "driveFile" &&
          previewMaterial.driveFileId ? (
            <iframe
              src={`https://drive.google.com/file/d/${previewMaterial.driveFileId}/preview`}
              className="w-full h-full border-0"
              allow="autoplay"
            />
          ) : (
            <iframe
              src={previewMaterial.url}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
