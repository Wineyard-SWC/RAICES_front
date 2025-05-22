// components/sprinthealth.tsx
'use client';

import { Card } from "@/components/card"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"

export const SprintHealth = () => {
  const { sprintComparison } = useSprintDataContext()
  
  const currentSprint = Array.isArray(sprintComparison) 
    ? sprintComparison.find(s => s.is_current)
    : null

  const getRiskExplanation = () => {
    if (!currentSprint) return "No current sprint data available"
    
    const { velocity, average_velocity, scope_changes, bugs_found, risk_assessment } = currentSprint
    
    const velocityRatio = (velocity / average_velocity).toFixed(2)
    const velocityPercentage = (velocity / average_velocity * 100).toFixed(0)

    let explanation = `${risk_assessment} assessment calculated based on:\n`
    explanation += `- Current velocity: ${velocity.toFixed(1)} points/day (${velocityPercentage}% of average)\n`
    explanation += `- Scope changes: ${scope_changes} tasks added during sprint\n`
    explanation += `- Bugs found: ${bugs_found} total issues\n\n`
    
    if (risk_assessment === "Low Risk") {
      explanation += `This sprint is on track with velocity at or above 80% of average (${velocityRatio}x), `
      explanation += `minimal scope changes (${scope_changes}), and acceptable bug count (${bugs_found}).`
    } 
    else if (risk_assessment === "Medium Risk") {
      explanation += `This sprint shows some risk with velocity below 80% of average (${velocityRatio}x), `
      explanation += `${scope_changes} scope changes, or elevated bug count (${bugs_found}). Consider adjustments.`
    } 
    else {
      explanation += `This sprint is high risk with velocity below 50% of average (${velocityRatio}x), `
      explanation += `${scope_changes} scope changes, or critical bug count (${bugs_found}). Immediate action recommended.`
    }
    
    return explanation
  }

  const healthMetrics = [
    {
      title: "Risk Assessment",
      value: currentSprint?.risk_assessment || "Not available",
      description: getRiskExplanation(),
      indicatorColor: currentSprint?.risk_assessment === "Low Risk" 
        ? "bg-green-500" 
        : currentSprint?.risk_assessment === "Medium Risk" 
          ? "bg-yellow-500" 
          : "bg-red-500"
    },
    {
      title: "Completion Progress",
      value: currentSprint?.completion_percentage 
        ? `${currentSprint.completion_percentage}%` 
        : "0%",
      description: `${currentSprint?.completed_story_points || 0} of ${currentSprint?.total_story_points || 0} story points completed`,
      indicatorColor: "bg-blue-500"
    },
  ]

  return (
    <Card className="p-6 shadow-sm bg-[#ffffff] flex flex-col justify-center h-full">
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
            <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">
              {metric.description}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}