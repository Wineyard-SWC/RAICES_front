"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

interface VelocityTrendChartProps {
  data: { sprint: string; planned: number; actual: number }[]
  height?: number
}

export function VelocityTrendChart({ data, height = 250 }: VelocityTrendChartProps) {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[#4a2b5c] mb-2">Velocity Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="sprint" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Planned" fill="#4a2b5c" />
          <Bar dataKey="Actual" fill="#b491c8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Uso

  const velocityData = [
    { sprint: "Sprint 1", Planned: 35, Actual: 28 },
    { sprint: "Sprint 2", Planned: 40, Actual: 34 },
    { sprint: "Sprint 3", Planned: 42, Actual: 39 },
    { sprint: "Current",  Planned: 38, Actual: 22 },
  ]
  <VelocityTrendChart data={velocityData} />  */