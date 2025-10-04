'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SolveButtonProps {
  assignmentId: string;
  onSolveComplete: () => void;
}

export default function SolveButton({ assignmentId, onSolveComplete }: SolveButtonProps) {
  const [isSolving, setIsSolving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiCompleteRef = useRef(false);

  // Cleanup function
  const cleanup = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    apiCompleteRef.current = false;
  };

  // Progress simulation
  const startProgress = () => {
    setProgress(0);
    const duration = 20000; // 20 seconds
    const intervalTime = 100; // Update every 100ms
    const increment = (99 / duration) * intervalTime; // Stop at 99%

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (apiCompleteRef.current) {
          return 100; // Jump to 100% if API completed
        }
        const newProgress = prev + increment;
        return newProgress >= 99 ? 99 : newProgress; // Cap at 99%
      });
    }, intervalTime);
  };

  const handleSolve = async () => {
    setIsSolving(true);
    setIsComplete(false);
    setProgress(0);

    // Start progress bar
    startProgress();

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

      // Mark API as complete
      apiCompleteRef.current = true;
      setProgress(100);
      setIsComplete(true);

      // Show success state briefly before calling completion
      setTimeout(() => {
        onSolveComplete();
        setIsSolving(false);
        setIsComplete(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Solve error:', error);
      alert('Failed to solve assignment. Please try again.');
      setIsSolving(false);
      setProgress(0);
    } finally {
      cleanup();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  if (isSolving) {
    return (
      <div className="space-y-3">
        <div className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-md">
          {isComplete ? (
            <>
              <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
              Complete!
            </>
          ) : (
            <>
              <Brain className="-ml-1 mr-2 h-4 w-4" />
              Processing...
            </>
          )}
        </div>
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1 text-center">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSolve}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-accent hover:bg-accent/90 text-accent-foreground transition-colors"
    >
      <Brain className="-ml-1 mr-2 h-4 w-4" />
      Solve Assignment
    </button>
  );
}