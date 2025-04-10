"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { ChevronDown } from "lucide-react"
import Image from "next/image"

type NavbarProps = {
  projectSelected: boolean
  onProjectSelect?: () => void
}

const Navbar = ({ projectSelected = false, onProjectSelect }: NavbarProps) => {
  const [activeTab, setActiveTab] = useState("Projects")
  const [generateOpen, setGenerateOpen] = useState(false)

  const handleTabClick = (tab: string) => {
    if (tab === "Projects" || projectSelected) {
      setActiveTab(tab)
    }
  }

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b border-black bg-[#ebe5eb]">
    
    {/* Logo on the left */}
    <div className="flex-shrink-0 h-[60px] flex items-center justify-center">
    <Link href="/" className="mr-8 flex items-center justify-center">
        <div className="flex items-center justify-center">
        <Image
            src="/img/raicesinvertido.png"
            alt="Logo RAICES"
            width={110}
            height={40}
            className="object-contain"
        />
        </div>
    </Link>
    </div>


      {/* Navigation items centered */}
      <div className="flex justify-center flex-grow">
        <div className="flex space-x-4">
          {["Dashboard", "Projects", "Roadmap", "Team", "Generate"].map((item) => {
            const isDisabled = item !== "Projects" && !projectSelected
            const isGenerate = item === "Generate"

            return (
              <div key={item} className="relative">
                <button
                  className={`flex items-center px-4 py-2 rounded-md ${
                    activeTab === item && !isDisabled
                      ? "bg-[#4a2b4a] text-white"
                      : isDisabled
                        ? "text-[#694969]/50 cursor-not-allowed"
                        : "text-[#694969] hover:bg-[#ebe5eb]"
                  }`}
                  onClick={() => handleTabClick(item)}
                  disabled={isDisabled}
                >
                  {item}
                  {isGenerate && <ChevronDown className="ml-2 h-4 w-4" />}
                </button>

                {isGenerate && generateOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]">
                        Generate Report
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]">
                        Generate Timeline
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile and notifications on the right */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <button className="relative">
          <Bell className="h-6 w-6 text-[#4a2b4a]" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="relative">
          <button className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#ebe5eb] overflow-hidden">
              <img src="/placeholder.svg?height=32&width=32" alt="User avatar" className="h-full w-full object-cover" />
            </div>
            <ChevronDown className="ml-1 h-4 w-4 text-[#4a2b4a]" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
