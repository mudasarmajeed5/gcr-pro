import { toast } from 'sonner';

export const getDriveDownloadUrl = (fileId: string) => 
  `https://drive.google.com/uc?export=download&id=${fileId}`;

export const downloadFile = async (url: string, filename: string): Promise<void> => {
  const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  
  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
  }, 1000);
};

export const collectDownloadableFiles = (courseMaterials: any[]) => {
  const filesToDownload: { url: string; filename: string }[] = [];
  
  courseMaterials.forEach((material) => {
    material.materials?.forEach((mat:any) => {
      if (mat.driveFile) {
        const file = mat.driveFile.driveFile;
        filesToDownload.push({
          url: getDriveDownloadUrl(file.id),
          filename: file.title,
        });
      }
      else if (mat.link && (mat.link.url.endsWith('.pdf') || mat.link.url.includes('drive.google.com'))) {
        filesToDownload.push({
          url: mat.link.url,
          filename: mat.link.title,
        });
      } else if (mat.form && mat.form.formUrl.endsWith('.pdf')) {
        filesToDownload.push({
          url: mat.form.formUrl,
          filename: mat.form.title,
        });
      }
    });
  });
  
  return filesToDownload;
};

export const handleDownloadAll = async (
  courseMaterials: any[],
  setDownloadProgress: (progress: number) => void,
  setIsDownloading: (isDownloading: boolean) => void
) => {
  setIsDownloading(true);
  setDownloadProgress(0);
  
  const filesToDownload = collectDownloadableFiles(courseMaterials);
  
  if (filesToDownload.length === 0) {
    toast.error('No downloadable materials found.');
    setIsDownloading(false);
    return { successful: 0, failed: 0 };
  }

  let successfulDownloads = 0;
  let failedDownloads = 0;

  for (let i = 0; i < filesToDownload.length; i++) {
    const file = filesToDownload[i];
    
    try {
      await downloadFile(file.url, file.filename);
      successfulDownloads++;
    } catch (error) {
      console.error(`Failed to download ${file.filename}:`, error);
      failedDownloads++;
      // Fallback: open in new tab if download fails
      window.open(file.url, '_blank');
    }
    
    // Update progress
    const progress = ((i + 1) / filesToDownload.length) * 100;
    setDownloadProgress(progress);
    
    // Add small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  setIsDownloading(false);
  
  return { successful: successfulDownloads, failed: failedDownloads };
};