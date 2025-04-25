"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BurndownChartProps {
  data: { day: string; remaining: number; ideal: number }[]
  height?: number
}

export function BurndownChart({ data, height = 250 }: BurndownChartProps) {
  return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Remaining" stroke="#4a2b5c" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Ideal" stroke="#b491c8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
  )
}