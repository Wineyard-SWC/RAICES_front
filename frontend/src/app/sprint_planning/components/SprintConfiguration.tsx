"use client"

import type React from "react"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Sprint } from "@/types/sprint"

interface SprintConfigurationProps {
  sprint: Sprint & { max_points?: number }
  onUpdate: (data: Partial<Sprint>) => void
}

export default function SprintConfiguration({ sprint, onUpdate }: SprintConfigurationProps) {
  const [name, setName] = useState(sprint.name)
  const [duration, setDuration] = useState(sprint.duration_weeks.toString())
  const [startDate, setStartDate] = useState(new Date(sprint.start_date).toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date(sprint.end_date).toISOString().split("T")[0])
  const [capacity, setCapacity] = useState((sprint.max_points ?? 0).toString())

  const handleSubmit = () => {
    onUpdate({
      name,
      duration_weeks: parseInt(duration) || 2,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      max_points: parseInt(capacity) || 0,
    })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value
    setStartDate(newStart)

    const weeks = parseInt(duration) || 2
    const end = new Date(newStart)
    end.setDate(end.getDate() + weeks * 7)
    setEndDate(end.toISOString().split("T")[0])

    handleSubmit()
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weeks = e.target.value
    setDuration(weeks)

    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + (parseInt(weeks) || 2) * 7)
    setEndDate(end.toISOString().split("T")[0])

    handleSubmit()
  }

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCapacity(e.target.value)
    onUpdate({ max_points: parseInt(e.target.value) || 0 })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
      <h2 className="mb-4 text-xl font-bold">Sprint Configuration</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm text-[#525252]">Sprint name</label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              handleSubmit()
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#525252]">Duration (weeks)</label>
          <Input type="number" min="1" max="8" value={duration} onChange={handleDurationChange} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#525252]">Start Date</label>
          <div className="relative">
            <Input type="date" value={startDate} onChange={handleStartDateChange} className="w-full pl-9" />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#525252]">End Date</label>
          <div className="relative">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                handleSubmit()
              }}
              className="w-full pl-9"
            />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#525252]">Team Capacity (Story Points)</label>
          <Input
            type="number"
            min="0"
            value={capacity}
            onChange={handleCapacityChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
