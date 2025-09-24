// store/preview-store.ts
import { create } from 'zustand';

type MaterialType = 'driveFile' | 'link' | 'youtubeVideo' | 'form';

interface PreviewMaterial {
  title: string;
  type: MaterialType;
  url: string;
  driveFileId?: string;
}

interface PreviewStore {
  previewMaterial: PreviewMaterial | null;
  openPreview: (material: PreviewMaterial) => void;
  closePreview: () => void;
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  previewMaterial: null,
  openPreview: (material) => set({ previewMaterial: material }),
  closePreview: () => set({ previewMaterial: null }),
}));