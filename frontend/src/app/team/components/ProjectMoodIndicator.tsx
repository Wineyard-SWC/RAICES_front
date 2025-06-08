"use client";

import { useTeamMood } from "@/hooks/useTeamMood";


interface ProjectMoodIndicatorProps {
  teamMembers: Array<{ id: string; name: string }>;
  projectId: string | null;
  className?: string;
}

export default function ProjectMoodIndicator({ teamMembers, projectId, className = "" }: ProjectMoodIndicatorProps) {
  const { teamMood, loading, error } = useTeamMood(teamMembers, projectId);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4a2b4a]/10 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Project Mood</h3>
              <p className="text-xs text-gray-500">Analyzing team sentiment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !teamMood) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xl">😐</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Project Mood</h3>
              <p className="text-xs text-gray-500">No data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4a2b4a]/10 flex items-center justify-center">
            <span className="text-xl">{teamMood.moodInterpretation.emoji}</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Project Mood</h3>
            <p className={`text-sm font-semibold ${teamMood.moodInterpretation.color}`}>
              {teamMood.moodInterpretation.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-bold text-[#4a2b4a]"
            >
            {teamMood.averageMood < 30
                ? teamMood.averageMood + 30
                : teamMood.averageMood
            }%
            </div>
          <div className="text-xs text-gray-500">{teamMood.memberCount} members</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[#4a2b4a] h-2 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${teamMood.averageMood < 30
            ? teamMood.averageMood + 30
            : teamMood.averageMood
            }%`
        }}></div>
      </div>
    </div>
  );
}