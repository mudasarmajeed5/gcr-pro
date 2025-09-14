'use client';

import React, { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';

interface SolveButtonProps {
  assignmentId: string;
  onSolveComplete: () => void;
}

export default function SolveButton({ assignmentId, onSolveComplete }: SolveButtonProps) {
  const [isSolving, setIsSolving] = useState(false);

  const handleSolve = async () => {
    setIsSolving(true);
    try {
      const response = await fetch('/api/assignments/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId }),
      });

      if (!response.ok) {
        throw new Error('Solving failed');
      }

      onSolveComplete();
    } catch (error) {
      console.error('Solve error:', error);
      alert('Failed to solve assignment. Please try again.');
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <button
      onClick={handleSolve}
      disabled={isSolving}
      className={`
        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors
        ${isSolving
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700'
        } text-white
      `}
    >
      {isSolving ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Solving...
        </>
      ) : (
        <>
          <Brain className="-ml-1 mr-2 h-4 w-4" />
          Solve with AI
        </>
      )}
    </button>
  );
}