"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeams } from "@/contexts/teamscontext";

type TeamDetailsViewProps = {
  teamId: string;
};

const TeamDetailsView = ({ teamId }: TeamDetailsViewProps) => {
  const router = useRouter();
  const { currentTeam, fetchTeam, teamMetrics, getTeamMetrics } = useTeams();

  useEffect(() => {
    fetchTeam(teamId);
    getTeamMetrics(teamId);
  }, [teamId]);

  const handleGoBack = () => {
    router.push('/team');
  };

  if (!currentTeam) {
    return (
      <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
        <div className="container mx-auto px-4">
          <p>Loading team details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text[1e1e1e]">My Team - {currentTeam.name}</h1>
        <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
          {currentTeam.description}
        </p>
        <button
          onClick={handleGoBack}
          className="text-[#4A2B4A] text-sm font-medium hover:underline mt-1 mb-3"
        >
          {"<- Go back "}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Team Members Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 mr-2 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h2 className="text-lg font-semibold">Team Members</h2>
            </div>
            
            {/* Team Members List */}
            <div className="space-y-4">
              {currentTeam.members.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 mr-3">
                      <div className="w-10 h-10 bg-[#ebe5eb] rounded-full flex items-center justify-center text-[#4a2b4a] font-bold">
                        {member.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>{member.tasksCompleted} tasks completed</span>
                        <span className="mx-2">•</span>
                        <span>{member.currentTasks} current tasks</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-2 py-1 rounded-full text-xs font-medium" 
                        style={{ 
                          backgroundColor: member.availability >= 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: member.availability >= 80 ? 'rgb(22, 163, 74)' : 'rgb(202, 138, 4)'
                        }}>
                        {member.availability}% available
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Team Metrics Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-6">
                <svg className="w-5 h-5 mr-2 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-lg font-semibold">Team Metrics</h2>
              </div>
              
              {/* Team Velocity */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Team Velocity</span>
                  <span className="text-sm font-medium">{teamMetrics?.velocity} SP/Sprint</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#4a2b4a] h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (teamMetrics?.velocity || 0) * 2)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Team Mood */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Team Mood</span>
                  <span className="text-sm font-medium">
                    {teamMetrics?.mood && teamMetrics.mood > 70 ? '😊' : teamMetrics?.mood && teamMetrics.mood > 40 ? '😐' : '😞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#4a2b4a] h-2 rounded-full" 
                    style={{ width: `${teamMetrics?.mood || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Tasks Overview */}
              <div className="bg-[#4a2b4a] text-white rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-2">Tasks Overview</h3>
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="text-xs opacity-80">Completed</div>
                    <div className="text-lg font-bold">{teamMetrics?.tasksCompleted}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">In Progress</div>
                    <div className="text-lg font-bold">{teamMetrics?.tasksInProgress}%</div>
                  </div>
                </div>
              </div>
              
              {/* Avg Story Time */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#EBE5EB] flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Avg. Story Time</span>
                </div>
                <span className="text-sm font-medium">{teamMetrics?.avgStoryTime} days</span>
              </div>
              
              {/* Sprint Progress */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#EBE5EB] flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Sprint Progress</span>
                </div>
                <span className="text-sm font-medium">{teamMetrics?.sprintProgress}%</span>
              </div>
            </div>
            
            {/* Manage Team Button */}
            <button className="w-full py-3 bg-[#4a2b4a] text-white rounded-md hover:bg-[#3d243d] transition-colors">
              Manage Team
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TeamDetailsView;