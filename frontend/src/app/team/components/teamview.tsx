"use client";

/*
 * TEAMS OVERVIEW COMPONENT
 * 
 * This component displays a list of teams with basic information and allows navigation
 * to individual team detail pages.
 * 
 * API INTEGRATION NOTES:
 * - Replace hardcoded team data with API calls
 * - Expected endpoints:
 *   1. GET /api/teams - List all teams with basic info
 *   2. POST /api/teams - Create a new team (for the Create Team button)
 *   3. GET /api/teams/search?query={searchTerm} - Search teams by name
 * 
 * - All sections marked with "HARDCODED DATA" comments should be replaced with
 *   data from these API endpoints
 */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define types for team members and teams
type TeamMember = {
  id: number;
  name: string;
  role: string;
  tasksCompleted: number;
  currentTasks: number;
  availability: number;
};

type FrontendTeam = {
  id: number;
  name: string;
  description: string;
  members: number;
  completed: number;
  upcoming: number;
};

type BackendTeam = {
  id: number;
  name: string;
  members: TeamMember[];
};

type Team = FrontendTeam | BackendTeam;

type TabState = {
  [key: number]: string;
};

const TeamsView = () => {
  const router = useRouter();
  
  // Function to navigate to team details page
  const navigateToTeamDetails = (teamId: number) => {
    router.push(`/team/${teamId}`);
  };
  // HARDCODED: This would typically come from an API
  const teams: Team[] = [
    {
      id: 1,
      name: "Frontend Development",
      description: "Responsible for user interface and experience",
      members: 5,
      completed: 105,
      upcoming: 23
    },
    {
      id: 2,
      name: "Backend Development",
      members: [
        {
          id: 1,
          name: "Jorge Castro",
          role: "Lead Backend Developer",
          tasksCompleted: 52,
          currentTasks: 3,
          availability: 70
        },
        {
          id: 2,
          name: "Alicia Garza",
          role: "Backend Developer",
          tasksCompleted: 25,
          currentTasks: 1,
          availability: 90
        }
      ]
    }
  ];

  // State for active tab (Overview/Members)
  const [activeTab, setActiveTab] = useState<TabState>({
    1: "overview", // Team 1 (Frontend) starts with overview tab
    2: "overview"  // Team 2 (Backend) starts with overview tab
  });

  // Function to toggle between tabs
  const toggleTab = (teamId: number, tab: string) => {
    setActiveTab(prev => ({
      ...prev,
      [teamId]: tab
    }));
  };

  return (
    <main className="min-h-screen py-10 bg-[#EBE5EB]/30">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text[1e1e1e]">Teams</h1>
        <p className="text-lg font-semibold text-[#694969] mt-2 mb-2">
          Manage your teams and track their current contribution
        </p>

        {/* Search and Create Team Section */}
        <div className="flex justify-between items-center mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] focus:border-transparent"
              placeholder="Search team name..."
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-[#4a2b4a] text-white rounded-md">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Team
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Frontend Team Card */}
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigateToTeamDetails(teams[0].id)}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Team - {teams[0].name}</h2>
              <button className="text-gray-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button 
                className={`py-2 px-4 ${activeTab[1] === 'overview' ? 'border-b-2 border-[#4a2b4a] font-medium' : 'text-gray-500'}`}
                onClick={() => toggleTab(1, 'overview')}
              >
                Overview
              </button>
              <button 
                className={`py-2 px-4 ${activeTab[1] === 'members' ? 'border-b-2 border-[#4a2b4a] font-medium' : 'text-gray-500'}`}
                onClick={() => toggleTab(1, 'members')}
              >
                Members
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab[1] === 'overview' && (
              <>
                <p className="text-sm text-gray-600 mb-6">{(teams[0] as FrontendTeam).description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                      <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold">{(teams[0] as FrontendTeam).members}</span>
                    <span className="text-xs text-gray-500">Members</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                      <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold">{(teams[0] as FrontendTeam).completed}</span>
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-[#ebe5eb] rounded-full mb-2">
                      <svg className="w-6 h-6 text-[#4a2b4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-bold">{(teams[0] as FrontendTeam).upcoming}</span>
                    <span className="text-xs text-gray-500">Upcoming</span>
                  </div>
                </div>
              </>
            )}

            {activeTab[1] === 'members' && (
              <div className="text-center py-8">
                {/* HARDCODED: This would be populated with actual team members */}
                <p className="text-gray-500">Members list would appear here</p>
              </div>
            )}
          </div>

          {/* Backend Team Card */}
          <div 
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigateToTeamDetails(teams[1].id)}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Team - {teams[1].name}</h2>
              <button className="text-gray-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button 
                className={`py-2 px-4 ${activeTab[2] === 'overview' ? 'border-b-2 border-[#4a2b4a] font-medium' : 'text-gray-500'}`}
                onClick={() => toggleTab(2, 'overview')}
              >
                Overview
              </button>
              <button 
                className={`py-2 px-4 ${activeTab[2] === 'members' ? 'border-b-2 border-[#4a2b4a] font-medium' : 'text-gray-500'}`}
                onClick={() => toggleTab(2, 'members')}
              >
                Members
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab[2] === 'overview' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Overview would appear here</p>
              </div>
            )}

            {activeTab[2] === 'members' && (
              <div className="space-y-4">
                {/* HARDCODED: Team members would come from API */}
                {((teams[1] as BackendTeam).members).map((member: TeamMember) => (
                  <div key={member.id} className="bg-gray-50 rounded-md p-4">
                    <div className="flex items-center">
                      <div className="relative w-10 h-10 mr-3">
                        {/* HARDCODED: Using placeholder avatar */}
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default TeamsView;
