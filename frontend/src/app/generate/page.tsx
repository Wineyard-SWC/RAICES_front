"use client"

import { FileText, Layers, Book } from "lucide-react"
import Navbar from "@/components/NavBar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GenerationCard } from "./components/generationcard"

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
          <GenerationCard
            title="Requirements"
            subtitle="Generate project requirements based on your project goals"
            description="Our AI analyzes your project description and generates comprehensive requirements that align with your goals."
            icon={<FileText className="h-6 w-6 text-[#4A2B4D]" />}
            href="/gen_requirements"
          />

          <GenerationCard
            title="Epics"
            subtitle="Create epic-level work items from your requirements"
            description="Transform your requirements into well-structured epics that organize your project into manageable chunks."
            icon={<Layers className="h-6 w-6 text-[#4A2B4D]" />}
            href="/gen_epics"
          />

          <GenerationCard
            title="User Stories"
            subtitle="Break down epics into detailed user stories"
            description="Convert your epics into user stories with acceptance criteria that your development team can implement."
            icon={<Book className="h-6 w-6 text-[#4A2B4D]" />}
            href="/gen_user_stories"
          />

        </div>
      </main>
    </div>
  )
}
