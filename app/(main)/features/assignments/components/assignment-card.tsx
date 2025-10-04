'use client';

import React from 'react';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import SolveButton from './solve-button';
import DownloadButton from './download-button';

interface Assignment {
  id: string;
  originalName: string;
  status: 'pending' | 'solved';
  createdAt: string;
  updatedAt: string;
  hasSolvedFile: boolean;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onStatusUpdate: (assignmentId: string, newStatus: 'pending' | 'solved') => void;
}

export default function AssignmentCard({ assignment, onStatusUpdate }: AssignmentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-accent" />;
      case 'solved':
        return <CheckCircle className="h-5 w-5 text-academic-secondary" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (assignment.status) {
      case 'pending':
        return 'bg-accent/20 text-accent-foreground';
      case 'solved':
        return 'bg-academic-secondary/20 text-academic-secondary';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FileText className="h-8 w-8 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-foreground text-lg">
              {assignment.originalName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Uploaded: {formatDate(assignment.createdAt)}
            </p>
            {assignment.status === 'solved' && (
              <p className="text-sm text-muted-foreground">
                Solved: {formatDate(assignment.updatedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {assignment.status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        {assignment.status === 'pending' && (
          <SolveButton
            assignmentId={assignment.id}
            onSolveComplete={() => onStatusUpdate(assignment.id, 'solved')}
          />
        )}

        {assignment.status === 'solved' && assignment.hasSolvedFile && (
          <DownloadButton assignmentId={assignment.id} />
        )}
      </div>
    </div>
  );
}