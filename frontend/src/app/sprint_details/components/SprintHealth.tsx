// components/sprinthealth.tsx
'use client';

import { Card } from "@/components/card"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"

export const SprintHealth = () => {
  const { sprintComparison } = useSprintDataContext()
  
  const currentSprint = Array.isArray(sprintComparison) 
    ? sprintComparison.find(s => s.is_current)
    : null

  const healthMetrics = [
    {
      title: "Risk Assessment",
      value: currentSprint?.risk_assessment || "Not available",
      description: "Based on current velocity",
      indicatorColor: currentSprint?.risk_assessment === "Low Risk" ? "bg-green-500" : "bg-red-500"
    },
    {
      title: "Tasks per day",
      value: currentSprint?.tasks_per_day ? `${currentSprint.tasks_per_day}` : "N/A",
      description: "Current burnup rate",
      indicatorColor: "bg-blue-500"
    },
    {
      title: "Estimated days remaining",
      value: currentSprint?.estimated_days_remaining ? `${currentSprint.estimated_days_remaining}` : "N/A",
      description: "Based on current velocity",
      indicatorColor: "bg-purple-500"
    },
    {
      title: "Scope Changes",
      value: currentSprint?.scope_changes ? `${currentSprint.scope_changes} tasks` : "0 tasks",
      description: "Added during sprint",
      indicatorColor: "bg-yellow-500"
    },
    {
      title: "Quality Metrics",
      value: currentSprint?.bugs_found ? `${currentSprint.bugs_found} bugs` : "0 bugs",
      description: currentSprint?.quality_metrics?.priority_distribution || "All P2 priority",
      indicatorColor: "bg-orange-500"
    }
  ]

  return (
    <Card className="p-4 shadow-sm bg-[#ffffff]">
      <h2 className="text-lg font-bold mb-3">Sprint Health</h2>
      <div className="space-y-4">
        {healthMetrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between">
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${metric.indicatorColor} mr-1`}></div>
                <span className="text-sm font-medium">{metric.value}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}