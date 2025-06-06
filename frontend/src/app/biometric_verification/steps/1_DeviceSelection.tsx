"use client"

import { Brain, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface DeviceSelectionProps {
  selectedDevices: string[]
  onDeviceToggle: (device: string) => void
  onNext: () => void
}

export default function DeviceSelection({ selectedDevices, onDeviceToggle, onNext }: DeviceSelectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Device Selection</h2>
      <p className="text-gray-600 mb-6">Select the biometric devices you want to use for verification.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => onDeviceToggle("muse2")}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedDevices.includes("muse2") ? "border-[#4a2b4a] bg-[#f5f0f5]" : "hover:border-[#4a2b4a]/50"
          }`}
        >
          <div className="flex items-center mb-2">
            <Checkbox checked={selectedDevices.includes("muse2")} className="mr-2" />
            <h3 className="font-medium">Muse 2</h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Brain className="h-4 w-4 mr-2" />
            <span>EEG θ/β Analysis (brain waves)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
          disabled={selectedDevices.length === 0}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
