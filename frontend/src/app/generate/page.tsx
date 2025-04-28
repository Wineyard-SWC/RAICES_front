"use client"

import Link from "next/link"
import { FileText, Layers, Book, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/NavBar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GeneratePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-[#ebe5eb]/30">
      {/* Navigation Bar */}

      <Navbar projectSelected={true} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {/* Título y descripción */}
        <div>
          <h1 className="text-4xl font-bold text-[#1e1e1e]">What will we work on today?</h1>
          <p className="text-[#694969] mt-2">
            Generate and manage your sprint planning artifacts with RACES AI assistant
          </p>
        </div>

        {/* Tarjeta de "Accelerate" */}
        <div className="my-10 rounded-lg bg-[#4A2B4D] p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold">Accelerate Your Sprint Planning</h2>
          <p className="max-w-3xl">
            Our AI assistant helps you generate requirements, epics, and user stories based on your project description.
            Save time and focus on what matters most.
          </p>
        </div>

        {/* Espacio adicional antes de “Generation Options” */}
        <div className="mt-10 mb-6">
          <h2 className="text-2xl font-bold text-[#1e1e1e]">Generation Options</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Requirements Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F5F5]">
              <FileText className="h-6 w-6 text-[#4A2B4D]" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#4A2B4D]">Requirements</h3>
            <p className="mb-2 text-sm text-gray-600">Generate project requirements based on your project goals</p>

            <div className="my-4 border-t border-gray-200"></div>

            <p className="mb-6 text-sm text-gray-600">
              Our AI analyzes your project description and generates comprehensive requirements that align with your
              goals.
            </p>

            <Link href="/gen_requirements">
              <Button
                variant="outline"
                className="mt-auto flex items-center space-x-2 border-[#4A2B4D] text-[#4A2B4D] hover:bg-[#F5F5F5]"
              >
                <span>Generate Requirements</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Epics Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F5F5]">
              <Layers className="h-6 w-6 text-[#4A2B4D]" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#4A2B4D]">Epics</h3>
            <p className="mb-2 text-sm text-gray-600">Create epic-level work items from your requirements</p>

            <div className="my-4 border-t border-gray-200"></div>

            <p className="mb-6 text-sm text-gray-600">
              Transform your requirements into well-structured epics that organize your project into manageable chunks.
            </p>

            <Link href="/gen_epics">
              <Button
                variant="outline"
                className="mt-auto flex items-center space-x-2 border-[#4A2B4D] text-[#4A2B4D] hover:bg-[#F5F5F5]"
              >
                <span>Generate Epics</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* User Stories Card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F5F5F5]">
              <Book className="h-6 w-6 text-[#4A2B4D]" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-[#4A2B4D]">User Stories</h3>
            <p className="mb-2 text-sm text-gray-600">Break down epics into detailed user stories</p>

            <div className="my-4 border-t border-gray-200"></div>

            <p className="mb-6 text-sm text-gray-600">
              Convert your epics into user stories with acceptance criteria that your development team can implement
            </p>

            <Link href="/gen_user_stories">
              <Button
                variant="outline"
                className="mt-auto flex items-center space-x-2 border-[#4A2B4D] text-[#4A2B4D] hover:bg-[#F5F5F5]"
              >
                <span>Generate User Stories</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
