"use client";

/*
 * TEAM DETAILS VIEW COMPONENT
 * 
 * This component renders the detailed view of a team based on the teamId prop.
 * 
 * API INTEGRATION NOTES:
 * - Replace hardcoded data with API calls to fetch team details
 * - Expected endpoints:
 *   1. GET /api/teams/:id - Basic team info and metrics
 *   2. GET /api/teams/:id/members - Team members data
 *   3. GET /api/teams/:id/metrics - Performance metrics
 * 
 * - All sections marked with "HARDCODED DATA" comments should be replaced with
 *   data from these API endpoints
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TeamMember = {
  id: number;
  name: string;
};

type TeamMetrics = {
  velocity: number;
  mood: number;
  tasksCompleted: number;
  tasksInProgress: number;
  avgStoryTime: number;
  sprintProgress: number;
};

type TeamDetailsViewProps = {
  teamId: string;
};

const TeamDetailsView = ({ teamId }: TeamDetailsViewProps) => {
  const router = useRouter();
  
  // HARDCODED DATA: In a real implementation, this would be fetched from an API using the teamId
  const teamName = "Wineyard";
  const teamDescription = "Track your team's performance and collaboration";

  // HARDCODED DATA: Metrics would be calculated from real project data
  const teamMetrics: TeamMetrics = {
    velocity: 35,
    mood: 80,
    tasksCompleted: 21,
    tasksInProgress: 79,
    avgStoryTime: 1.5,
    sprintProgress: 51
  };

  const handleGoBack = () => {
    router.push('/team');
  };

  return (
    <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text[1e1e1e]">My Team - {teamName}</h1>
        <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
          {teamDescription}
        </p>
        <button
  onClick={handleGoBack}
  className="text-[#4A2B4A] text-sm font-medium hover:underline mt-1 mb-3"
>
  {"<- Go back "}
</button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Team Members Section - Takes up 2/3 on large screens */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 mr-2 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h2 className="text-lg font-semibold">Team Members</h2>
            </div>
            
            {/* Team Members Visualization */}
            <div className="relative h-64 flex items-center justify-center">
              {/* PLACEHOLDER: This area would contain team member visualization */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#ebe5eb] flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">Team members visualization will be implemented here</p>
              </div>
            </div>
          </div>
          
          {/* Team Metrics Section - Takes up 1/3 on large screens */}
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
                  {/* HARDCODED: Would be calculated from sprint data */}
                  <span className="text-sm font-medium">{teamMetrics.velocity} SP/Sprint</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* HARDCODED: Width percentage would be based on actual velocity metrics */}
                  <div className="bg-[#4a2b4a] h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              {/* Team Mood */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Team Mood</span>
                  {/* HARDCODED: Would be based on team surveys or feedback */}
                  <span className="text-sm font-medium">😊</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {/* HARDCODED: Width percentage would reflect actual team mood metrics */}
                  <div className="bg-[#4a2b4a] h-2 rounded-full" style={{ width: `${teamMetrics.mood}%` }}></div>
                </div>
              </div>
              
              {/* Tasks Overview */}
              <div className="bg-[#4a2b4a] text-white rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-2">Tasks Overview</h3>
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="text-xs opacity-80">Completed</div>
                    {/* HARDCODED: Would be calculated from actual task data */}
                    <div className="text-lg font-bold">{teamMetrics.tasksCompleted}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">In Progress</div>
                    {/* HARDCODED: Would be calculated from actual task data */}
                    <div className="text-lg font-bold">{teamMetrics.tasksInProgress}%</div>
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
                {/* HARDCODED: Would be calculated from actual story completion times */}
                <span className="text-sm font-medium">{teamMetrics.avgStoryTime} days</span>
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
                {/* HARDCODED: Would be calculated from actual sprint data */}
                <span className="text-sm font-medium">{teamMetrics.sprintProgress}%</span>
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
