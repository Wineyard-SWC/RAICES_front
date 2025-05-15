'use client';

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/card"
import Navbar from "@/components/NavBar"
import SprintChartsSection from "./components/sprintchartssection";
import { SprintComparison } from "./components/SprintComparison"
import { useSprintDataContext } from "@/contexts/sprintdatacontext"

export default function SprintDetails() {
  const { sprintComparison } = useSprintDataContext()

  return (
    <div className="min-h-screen bg-[#f0ebf7]">
      <Navbar projectSelected={true} />

      <main className="container mx-auto p-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Sprint Details</h1>
          <p className="text-gray-600">Track sprint progress and manage tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <Card className="lg:col-span-3 p-4 shadow-sm bg-[#ffffff]">
            <h2 className="text-lg font-bold mb-3">Sprint Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Risk Assessment</h3>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-sm font-medium">Low Risk</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Based on current velocity</div>
              </div>

              <div>
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Scope Changes</h3>
                  <div className="text-sm font-medium">
                    {(Array.isArray(sprintComparison) ? sprintComparison.find(s => s.is_current)?.scope_changes : 0) || 0} tasks
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Added during sprint</div>
              </div>

              <div>
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Blockers</h3>
                  <div className="text-sm font-medium">1 active</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Avg resolution: 1.5 days</div>
              </div>

              <div>
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Quality Metrics</h3>
                  <div className="text-sm font-medium">
                    {(Array.isArray(sprintComparison) ? sprintComparison.find(s => s.is_current)?.bugs_found : 0) || 0} bugs
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">All P2 priority</div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-9">
            <Card className="p-4 shadow-sm bg-[#ffffff]">
              <SprintChartsSection />
            </Card>
          </div>
        </div>

        <SprintComparison />
      </main>
    </div>
  )
}