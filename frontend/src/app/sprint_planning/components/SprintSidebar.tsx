"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ChevronLeft, ChevronRight, X, Users, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/progress"
import type { Sprint } from "@/types/sprint"
import type { Task } from "@/types/task"
import SelectedCard from "./SelectedCard"          

interface Props {
  sprint:   Sprint
  isOpen:   boolean
  onToggle: () => void
  onSave:   () => Promise<Sprint | null>
  onToggleUserStory?: (userStoryId: string) => void
  tasks: Task[]  
}

export default function SprintSidebar({
  sprint,
  isOpen,
  onToggle,
  onSave,
  onToggleUserStory,
  tasks = []
}: Props) {

  const tasksMap = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach(task => {
      map.set(task.id, task);
    });
    return map;
  }, [tasks]);


  const selectedStories = sprint.user_stories
    .filter(s => s.selected)          
    .filter(s => !!s.userStory)       
  
  const totalPoints = selectedStories.reduce((sum, story) => {
    const storyTasks = (story.tasks || [])
      .map(taskId => tasksMap.get(taskId))
      .filter(Boolean) as Task[];
    
    return sum + storyTasks.reduce((acc, task) => acc + (task.story_points || 0), 0);
  }, 0);

  const teamCapacity = (sprint.team_members || []).reduce(
    (sum, member) => sum + (member?.capacity ?? 0), 
    0
  )
  const pointsPercentage = teamCapacity > 0 ? Math.round((totalPoints / teamCapacity) * 100) : 0
  const displayPercentage = Math.min(pointsPercentage, 100)
  const overPercentage = pointsPercentage > 100 ? pointsPercentage - 100 : 0

  const storyCount = selectedStories.length
  const bugCount = 0

   return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "w-80" : "w-12"
      } bg-white border-l border-gray-200 sticky top-0 h-screen`}
    >
      <button
        onClick={onToggle}
        className="absolute top-1/2 -left-3 z-10 h-12 w-6 -translate-y-1/2 transform rounded-l-md border border-gray-200 bg-white text-[#4a2b4a] hover:bg-[#f5f0f1]"
      >
        {isOpen ? <ChevronRight className="mx-auto h-5 w-5" /> : <ChevronLeft className="mx-auto h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="flex h-[calc(100vh-41px)] flex-col overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Sprint Summary</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="mb-3 font-medium">Sprint Details</h3>
              <div className="space-y-2">
                <Detail label="Name" value={sprint.name || "Untitled Sprint"} />
                <Detail label="Duration" value={`${sprint.duration_weeks || 0} weeks`} />
                <Detail
                  label="Dates"
                  value={`${new Date(sprint.start_date || new Date()).toLocaleDateString()} – ${new Date(
                    sprint.end_date || new Date()
                  ).toLocaleDateString()}`}
                />
                <Detail label="Team Size" value={`${(sprint.team_members || []).length} members`} />
              </div>
            </section>

            <section>
              <h3 className="mb-3 font-medium">Selected Items</h3>
              <div className="space-y-2">
                {selectedStories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-gray-500 mb-1">No user stories selected</p>
                    <p className="text-xs text-gray-400">
                      Select stories from the backlog to add them to your sprint
                    </p>
                  </div>
                ) : (
                  selectedStories.map(story => {
                    const storyTasks = (story.tasks || [])
                      .map(taskId => tasksMap.get(taskId))
                      .filter(Boolean) as Task[];
                    
                    const storyPoints = storyTasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
                    
                    return (
                      <SelectedCard
                        key={story.id}
                        id={story.id}
                        type="story"
                        title={story.userStory?.title ?? "Untitled"}
                        points={storyPoints}
                        tasksCount={storyTasks.length}
                        onRemove={
                          onToggleUserStory ? () => onToggleUserStory(story.id) : undefined
                        }
                      />
                    );
                  })
                )}
              </div>
            </section>

            <section>
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-gray-500">Sprint Points</span>
                <span className="text-sm font-medium">
                {totalPoints}/{teamCapacity} - {displayPercentage}%{overPercentage > 0 ? ` (+ ${overPercentage}%)` : ""}
                </span>
              </div>
              <Progress
                value={displayPercentage}
                className="h-2 bg-gray-200"
                indicatorClassName="bg-[#4a2b4a]"
              />
            </section>

            <section>
              <h3 className="mb-3 font-medium">Item Types</h3>
              <div className="grid grid-cols-2 gap-2">
                <StatBox count={storyCount} label="Stories" color="#440071" />
                <StatBox count={bugCount}   label="Bugs"    color="#ff0000" />
              </div>
            </section>

            <section className="mt-auto space-y-2">
              <Link
                href={`/task_assignment?projectId=${sprint.project_id}&sprintId=${sprint.id}`}
                passHref
              >
                <Button className="w-full bg-[#4a2b4a] text-white hover:bg-[#694969]">
                  <Users className="mr-2 h-4 w-4" />
                  Task Assignment
                </Button>
              </Link>
              <div></div>
              <Button
                variant="outline"
                className="w-full border-[#4a2b4a] text-[#4a2b4a] hover:bg-[#f5f0f1]"
                onClick={onSave}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Sprint Plan
              </Button>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function StatBox({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-[#f5f0f1] p-2">
      <span className="text-lg font-bold" style={{ color }}>
        {count}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}