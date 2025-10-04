/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface UploadAssignmentProps {
  onUploadComplete: (assignment: any) => void;
}

export default function UploadAssignment({ onUploadComplete }: UploadAssignmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    const files = Array.from(e.dataTransfer.files);
    const docxFile = files.find(file => file.name.endsWith('.docx'));

    if (docxFile) {
      setSelectedFile(docxFile);
    } else {
      alert('Please select a .docx file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      alert('Please select a .docx file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/assignments/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const assignment = await response.json();
      onUploadComplete(assignment);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-border/80'
            }
          `}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">Upload your assignment</p>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your .docx file here, or click to browse
          </p>
          <input
            type="file"
            accept=".docx"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-muted/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-muted/20 rounded transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`
              w-full py-2 px-4 rounded-md font-medium transition-colors
              ${isUploading
                ? 'bg-muted/40 cursor-not-allowed text-muted-foreground'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }
            `}
          >
            {isUploading ? 'Uploading...' : 'Upload Assignment'}
          </button>
        </div>
      )}
    </div>
  );
}