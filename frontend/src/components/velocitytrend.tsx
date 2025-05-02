"use client"

import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts"

interface VelocityTrendChartProps {
  data: { sprint: string; Planned: number; Actual: number }[]
  height?: number
}

export function VelocityTrendChart({ data, height = 250 }: VelocityTrendChartProps) {
  const isEmpty = !Array.isArray(data) || !data.some(d => d.Planned > 0 || d.Actual > 0)

  return (
    <div className="bg-white border border-[#D3C7D3] rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[#4a2b5c] mb-2">Velocity Trend</h3>
      {isEmpty ? (
        <div className="text-center text-[#888] py-10">
          Start generating to see your velocity trend
        </div>
      ) : (
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
      )}
    </div>
  )
}