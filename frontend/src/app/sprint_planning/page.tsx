"use client";

import { Suspense } from 'react';
import SprintPlanningContent from './SprintPlanningContent';

export default function SprintPlanningPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800"></div>
      </div>
    }>
      <SprintPlanningContent />
    </Suspense>
  );
}