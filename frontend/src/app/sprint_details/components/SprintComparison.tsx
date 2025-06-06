'use client';

import { Card } from "@/components/card"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"
import { useMemo } from "react"

export function SprintComparison() {
  const { sprintComparison } = useSprintDataContext();

  // Ordenar sprints: current primero, luego los demás por fecha de inicio (más recientes primero)
  const sortedSprints = useMemo(() => {
    if (!Array.isArray(sprintComparison) || sprintComparison.length === 0) {
      return []
    }

    return [...sprintComparison].sort((a, b) => {
      // Si uno es current y el otro no, el current va primero
      if (a.is_current && !b.is_current) return -1
      if (!a.is_current && b.is_current) return 1
      
      // Si ambos son current o ambos no son current, ordenar por fecha de inicio (más reciente primero)
      const dateA = new Date(a.start_date).getTime()
      const dateB = new Date(b.start_date).getTime()
      return dateB - dateA // Descendente (más reciente primero)
    })
  }, [sprintComparison])

  return (
    <Card className="p-6 shadow-sm bg-[#ffffff] mb-6">
      <h2 className="text-xl font-bold mb-6">Sprint Comparison</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              <th className="px-6 py-3">Sprint</th>
              <th className="px-6 py-3">Velocity</th>
              <th className="px-6 py-3">Completion %</th>
              <th className="px-6 py-3">Scope Changes</th>
              <th className="px-6 py-3">Bugs Found</th>
              <th className="px-6 py-3">Days Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedSprints.length > 0 ? (
              sortedSprints.map((sprint) => (
                <tr 
                  key={sprint.sprint_id}
                  className={sprint.is_current ? "bg-purple-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {sprint.sprint_name}
                    {sprint.is_current && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sprint.completed_story_points}/{sprint.total_story_points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`${
                        sprint.completion_percentage >= 90 ? 'text-green-600' :
                        sprint.completion_percentage >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      } font-medium`}>
                        {sprint.completion_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${
                      sprint.scope_changes > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {sprint.scope_changes > 0 ? `+${sprint.scope_changes}` : sprint.scope_changes}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${
                      sprint.bugs_found > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {sprint.bugs_found}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${
                      sprint.days_left <= 2 && sprint.is_current ? 'text-red-600 font-medium' :
                      sprint.days_left <= 5 && sprint.is_current ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {sprint.is_current ? `${sprint.days_left} days` : 'Completed'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No sprint data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}