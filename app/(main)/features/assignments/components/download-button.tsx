'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Assignment } from '@/types/Assignment';

interface DownloadButtonProps {
  assignmentId: string;
  filename?: string;
  className?: string;
  assignment?: Assignment; // For accessing originalName
}

export default function DownloadButton({
  assignmentId,
  filename,
  className = '',
  assignment
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('idle');

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
      link.download = filename ? `${filename}` : 'solved_assignment.docx';
      document.body.appendChild(link);
      link.click();
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
      alert('Download failed. Please try again.');
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
      return `${baseClasses} bg-green-400 cursor-not-allowed text-white`;
    }

    if (downloadStatus === 'success') {
      return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
    }

    if (downloadStatus === 'error') {
      return `${baseClasses} bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive`;
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