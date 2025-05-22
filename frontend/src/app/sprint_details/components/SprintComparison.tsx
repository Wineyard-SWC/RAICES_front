'use client';

import { Card } from "@/components/card"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"

export function SprintComparison() {
  const { sprintComparison } = useSprintDataContext();

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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.isArray(sprintComparison) && sprintComparison.length > 0 ? (
              sprintComparison.map((sprint) => (
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
                    {sprint.completion_percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sprint.scope_changes > 0 ? `+${sprint.scope_changes}` : sprint.scope_changes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sprint.bugs_found}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
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