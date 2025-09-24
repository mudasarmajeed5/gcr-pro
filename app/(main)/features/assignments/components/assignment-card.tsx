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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'solved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (assignment.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'solved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FileText className="h-8 w-8 text-blue-500 mt-1" />
          <div>
            <h3 className="font-medium text-gray-900 text-lg">
              {assignment.originalName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Uploaded: {formatDate(assignment.createdAt)}
            </p>
            {assignment.status === 'solved' && (
              <p className="text-sm text-gray-500">
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