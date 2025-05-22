"use client"

import { Suspense } from 'react';
import TaskAssignmentContent from './TaskAssignmentContent';

export default function TaskAssignmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800"></div>
      </div>
    }>
      <TaskAssignmentContent />
    </Suspense>
  );
}
