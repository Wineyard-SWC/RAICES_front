"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BurndownChartProps {
  data: { day: string; Remaining: number; Ideal: number }[]
  height?: number
  simple?: boolean
}

export function BurndownChart({ data, height = 250, simple = false }: BurndownChartProps) {
  const isEmpty = data.length === 0

  return (
    <div className="bg-white border border-[#D3C7D3] rounded-md p-4 shadow-sm">
      {!simple && (
        <h3 className="text-lg font-semibold text-[#4a2b5c] mb-2">Burndown Chart</h3>
      )}
      {isEmpty ? (
        <div className="text-center text-[#888] py-10">Start generating to see your burndown chart</div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            {!simple && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            {!simple && <XAxis dataKey="day" />}
            {!simple && <YAxis />}
            {!simple && <Tooltip />}
            {!simple && <Legend />}
            <Line type="monotone" dataKey="Remaining" stroke="#4a2b5c" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Ideal" stroke="#b491c8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}