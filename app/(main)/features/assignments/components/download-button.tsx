'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface DownloadButtonProps {
  assignmentId: string;
  filename?: string;
  className?: string;
}

export default function DownloadButton({ 
  assignmentId, 
  filename,
  className = '' 
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('idle');
    
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/download`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the blob and content type
      const blob = await response.blob();
      const contentType = response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Extract filename from headers or use provided/default
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = filename || 'solved_assignment.docx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));
      
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = downloadFilename;
      link.setAttribute('download', downloadFilename);
      
      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Show success state briefly
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2000);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      alert(`Download failed: ${errorMessage}`);
      
      // Reset error state after a delay
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonContent = () => {
    if (isDownloading) {
      return (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Downloading...
        </>
      );
    }
    
    if (downloadStatus === 'success') {
      return (
        <>
          <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
          Downloaded!
        </>
      );
    }
    
    if (downloadStatus === 'error') {
      return (
        <>
          <AlertCircle className="-ml-1 mr-2 h-4 w-4" />
          Try Again
        </>
      );
    }
    
    return (
      <>
        <Download className="-ml-1 mr-2 h-4 w-4" />
        Download Solution
      </>
    );
  };

  const getButtonClassName = () => {
    const baseClasses = `
      inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    `;
    
    if (isDownloading) {
      return `${baseClasses} bg-gray-400 cursor-not-allowed text-white`;
    }
    
    if (downloadStatus === 'success') {
      return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
    }
    
    if (downloadStatus === 'error') {
      return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
    }
    
    return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 hover:shadow-md transform hover:-translate-y-0.5`;
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`${getButtonClassName()} ${className}`}
      title={isDownloading ? 'Downloading...' : 'Download solved assignment'}
      aria-label={isDownloading ? 'Downloading assignment solution' : 'Download assignment solution'}
    >
      {getButtonContent()}
    </button>
  );
}