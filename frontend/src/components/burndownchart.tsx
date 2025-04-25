"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BurndownChartProps {
  data: { day: string; remaining: number; ideal: number }[]
  height?: number
}

export function BurndownChart({ data, height = 250 }: BurndownChartProps) {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[#4a2b5c] mb-2">Burndown Chart</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Remaining" stroke="#4a2b5c" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Ideal" stroke="#b491c8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Uso
const burndownData = [
  { day: "Day 1", remaining: 100, ideal: 90 },
  { day: "Day 2", remaining: 90,  ideal: 80 },
  { day: "Day 3", remaining: 82,  ideal: 70 },
  { day: "Day 4", remaining: 76,  ideal: 60 },
  { day: "Day 5", remaining: 65,  ideal: 50 },
  { day: "Day 6", remaining: 58,  ideal: 40 },
  { day: "Day 7", remaining: 45,  ideal: 30 },
  { day: "Day 8", remaining: 35,  ideal: 20 },
  { day: "Day 9", remaining: 24,  ideal: 10 },
  { day: "Day 10", remaining: 15, ideal: 0  },
]

<BurndownChart data={burndownData} />
*/