// Here's how you can modify your CalendarPageView component to integrate the team tasks view

import { useState, useEffect } from "react"
import SprintProgressCard from "./sprintcalendar.progresscard"
import BurndownChartCard from "./sprintcalendar.burndownchartcard"
import TaskStatusCard from "./sprintcalendar.taskstatuscard"
import TeamWorkloadCard from "./sprintcalendar.teamworkloadcard"
import CalendarControls from "./sprintcalendar.calendarcontrols"
import CalendarGrid from "./sprintcalendar.calendargrid"
import TeamTasksView from "./sprintcalendar.teamtasksview" // Import the new component
import { UserStory } from "@/types/userstory" // Import the UserStory type
import { getProjectUserStories } from "@/utils/getProjectUserStories" // Import the API function

// Sample developer data for the team view
const developerData = [
  {
    id: "1",
    name: "Jorge Castro",
    role: "Lead Backend Developer",
    hoursAllocated: 24,
    hoursTotal: 40,
    tasks: [
      {
        id: "task1",
        title: "Implement user authentication",
        description: "Add email/password and social login options.",
        dateRange: { start: "1", end: "6" },
        status: "In Progress",
        type: "STORY",
        points: 8
      },
      {
        id: "task2",
        title: "Implement user authentication",
        description: "Add email/password and social login options.",
        dateRange: { start: "3", end: "6" },
        status: "In Progress",
        type: "STORY",
        points: 8
      }
    ]
  },
  {
    id: "2",
    name: "Alicia Garza",
    role: "Backend Developer",
    hoursAllocated: 24,
    hoursTotal: 40,
    tasks: [
      {
        id: "task3",
        title: "Optimize database queries for product listing",
        description: "Improve performance of main product catalog",
        dateRange: { start: "1", end: "6" },
        status: "In Progress",
        type: "TASK",
        points: 3
      },
      {
        id: "task4",
        title: "Implement email notification system",
        description: "Send emails for account actions and order updates",
        dateRange: { start: "1", end: "6" },
        status: "To do",
        type: "STORY",
        points: 4
      },
      {
        id: "task5",
        title: "Fix checkout payment processing error",
        description: "Address issue with payment gateway integration",
        dateRange: { start: "1", end: "6" },
        status: "To do",
        type: "BUG",
        points: 5
      }
    ]
  }
];

interface CalendarPageProps {
  defaultViewMode?: "week" | "month"
  onBack: () => void
}

const burndownData = [
  { day: "Day 0", Remaining: 100, Ideal: 100 },
  { day: "Day 1", Remaining: 95, Ideal: 90 },
  { day: "Day 2", Remaining: 90, Ideal: 80 },
  { day: "Day 3", Remaining: 82, Ideal: 70 },
  { day: "Day 4", Remaining: 76, Ideal: 60 },
  { day: "Day 5", Remaining: 65, Ideal: 50 },
  { day: "Day 6", Remaining: 58, Ideal: 40 },
  { day: "Day 7", Remaining: 45, Ideal: 30 },
  { day: "Day 8", Remaining: 35, Ideal: 20 },
  { day: "Day 9", Remaining: 24, Ideal: 10 },
  { day: "Day 10", Remaining: 15, Ideal: 0 },
];

const today = new Date()
const todayString = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

// Calculate sprint dates (assuming 2-week sprints)
const getSprintDates = () => {
  const currentDate = new Date();
  
  // Find the start of the current sprint (assuming sprints start on Mondays)
  const startDate = new Date(currentDate);
  const daysSinceMonday = (currentDate.getDay() + 6) % 7; // Days since last Monday (0 = Monday, 6 = Sunday)
  startDate.setDate(currentDate.getDate() - daysSinceMonday);
  
  // Find the end of the sprint (2 weeks after start date, ending on Friday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 11); // 11 days = 2 weeks minus weekend
  
  // Calculate sprint number (simplified example - you may want to use a more sophisticated calculation)
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const weeksSinceStartOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const sprintNumber = Math.floor(weeksSinceStartOfYear / 2) + 1;
  
  // Format dates
  const formatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const startDateFormatted = startDate.toLocaleDateString('en-US', formatOptions);
  const endDateFormatted = endDate.toLocaleDateString('en-US', formatOptions);
  
  return {
    sprintNumber,
    startDate,
    endDate,
    startDateFormatted,
    endDateFormatted
  };
};

const sprintInfo = getSprintDates();

const initialHeight = burndownData[0].Remaining;
const lastData = burndownData[burndownData.length - 1];
const actualPercentage = Math.round(((initialHeight - lastData.Remaining) / initialHeight) * 100);
const idealPercentage = Math.round(((initialHeight - lastData.Ideal) / initialHeight) * 100);
  
export default function CalendarPageView({defaultViewMode = "week", onBack}: CalendarPageProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">(defaultViewMode);
  // Add a new state to track whether team view or calendar grid should be shown
  const [showTeamView, setShowTeamView] = useState<boolean>(false);
  // Add state for backlog items
  const [backlogItems, setBacklogItems] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!localStorage.getItem("currentProjectId")) {
      localStorage.setItem("currentProjectId", "calendar-view-project")
    }
    
    // Fetch backlog items
    fetchBacklogItems();
  }, []);
  
  // Function to fetch backlog items from the API
  const fetchBacklogItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current project ID from localStorage
      const projectId = localStorage.getItem("currentProjectId");
      
      if (!projectId) {
        console.error("No project ID found in localStorage");
        setError("No project ID found. Please select a project first.");
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching backlog items for project:", projectId);
      
      // Fetch user stories from the API
      const userStories = await getProjectUserStories(projectId);
      console.log("All user stories fetched:", userStories);
      
      // Check if we have any user stories
      if (!userStories || userStories.length === 0) {
        console.warn("No user stories found for this project");
        setError("No user stories found for this project. Please create some or select a different project.");
        setIsLoading(false);
        return;
      }
      
      // Log the status_khanban values to see what's available
      const statusValues = userStories.map(story => story.status_khanban);
      console.log("Available status values:", [...new Set(statusValues)]);
      
      // Filter for items that are in "To Do" or "In Progress" status
      const backlogUserStories = userStories.filter(story => 
        story.status_khanban === 'To Do' || 
        story.status_khanban === 'In Progress'
      );
      
      // If no stories match our filter, show a message but don't use all stories as fallback
      if (backlogUserStories.length === 0) {
        console.warn("No stories found with 'To Do' or 'In Progress' status.");
        setError("No stories found with 'To Do' or 'In Progress' status. Please update story statuses in the backlog view.");
        setBacklogItems([]);
      } else {
        console.log("Filtered backlog items:", backlogUserStories);
        setBacklogItems(backlogUserStories);
      }
    } catch (error) {
      console.error("Error fetching backlog items:", error);
      setError("Failed to fetch backlog items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for task menu clicks
  const handleTaskMenuClick = (taskId: string) => {
    console.log(`Task menu clicked: ${taskId}`);
    // Add your task menu handling logic here
  };
  
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-4xl font-bold text-[#1e1e1e]">Sprint Calendar</h1>
      </div>
      <div className="mb-2">
        <p className=" text-lg font-semibold text-[#694969] mt-2 mb-2">Track and manage task throught your sprint</p>
        <button
          onClick={onBack}
          className="text-[#4A2B4A] text-sm font-medium hover:underline"
        > {"<- Go back "}
        </button>
      </div>
      {/* Sprint Overview Card */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sprint {sprintInfo.sprintNumber} ({sprintInfo.startDateFormatted} - {sprintInfo.endDateFormatted})</h2>
          <div className="flex gap-2">
            <button className="px-2 py-1 border border-[#D3C7D3] rounded-md text-m">&lt;</button>
            <button className="px-2 py-1 border border-[#D3C7D3] rounded-md text-m font-semibold">{todayString}</button>
            <button className="px-2 py-1 border border-[#D3C7D3] rounded-md text-m">&gt;</button>
          </div>
        </div>
        {/* Cards inside */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SprintProgressCard completedTasks={10} totalTasks={20}/>
          <BurndownChartCard actualPercentage={actualPercentage} idealPercentage={idealPercentage} burndownData={burndownData} />
          <TaskStatusCard />
          <TeamWorkloadCard />
        </div>
      </div>
      {/* Calendar Controls + Grid */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Modified CalendarControls to toggle between views */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button 
              className={!showTeamView ? "px-3 py-1 rounded border border-[#4a2b4a] text-m bg-[#4A2B4D] text-white" : "px-3 py-1 rounded border border-[#4a2b4a] text-m bg-[#f5f0f1] text-[#4A2B4D]"}
              onClick={() => setShowTeamView(false)}
            >
              Week View
            </button>
            <button 
              className={showTeamView ? "px-3 py-1 rounded border border-[#4a2b4a] text-m bg-[#4A2B4D] text-white" : "px-3 py-1 rounded border border-[#4a2b4a] text-m bg-[#f5f0f1] text-[#4A2B4D]"}
              onClick={() => setShowTeamView(true)}
            >
              Team View
            </button>
          </div>
          
          <div className="flex items-center">
            <input
              type="text"
              className="pl-8 pr-4 py-1 border border-[#D3C7D3] rounded text-m w-40 md:w-64"
              placeholder="Search tasks..."
            />
            <select className="ml-2 px-3 py-1 rounded text-m border border-[#D3C7D3]">
              <option>All Status</option>
              <option>To do</option>
              <option>In Progress</option>
              <option>Review</option>
              <option>Done</option>
            </select>
            
            {/* Refresh button for backlog items */}
            <button
              onClick={fetchBacklogItems}
              disabled={isLoading}
              className="ml-2 px-3 py-1 rounded border border-[#4a2b4a] text-m bg-[#f5f0f1] text-[#4A2B4D] hover:bg-[#e2d4e4]"
            >
              {isLoading ? 'Loading...' : '↻ Refresh Backlog'}
            </button>
          </div>
        </div>
        
        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 text-blue-700 rounded">
            Loading backlog items...
          </div>
        )}
        
        {/* Conditionally render team view or calendar grid based on showTeamView state */}
        {showTeamView ? (
          <TeamTasksView 
            developers={developerData} 
            onTaskMenuClick={handleTaskMenuClick} 
          />
        ) : (
          <CalendarGrid 
            backlogItems={backlogItems} 
          />
        )}
      </div>
    </div>
  )
}