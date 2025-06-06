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
  console.log('VelocityTrendChart received data:', data)
  
  // Cambiar la lógica: mostrar el gráfico si hay sprints, aunque tengan valores 0
  const hasData = Array.isArray(data) && data.length > 0
  
  return (
    <div className="bg-white border border-[#D3C7D3] rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[#4a2b5c] mb-2">Velocity Trend</h3>
      {!hasData ? (
        <div className="text-center text-[#888] py-10">
          No sprints found. Create a sprint to see velocity trends.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="sprint" 
              tick={{ fontSize: 12 }}
              angle={data.length > 3 ? -45 : 0}
              textAnchor={data.length > 3 ? "end" : "middle"}
              height={data.length > 3 ? 60 : 40}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                `${value} SP`, 
                name === 'Planned' ? 'Planned' : 'Actual'
              ]}
            />
            <Legend />
            <Bar dataKey="Planned" fill="#4a2b5c" name="Planned" />
            <Bar dataKey="Actual" fill="#b491c8" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}