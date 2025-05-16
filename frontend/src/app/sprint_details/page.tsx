'use client';

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/card"
import Navbar from "@/components/NavBar"
import SprintChartsSection from "./components/SprintChartsSection";
import { SprintComparison } from "./components/SprintComparison"
import { SprintHealth } from "./components/SprintHealth";

export default function SprintDetails() {
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
          <div className="lg:col-span-3">
            <SprintHealth />
          </div>

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