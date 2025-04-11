"use client"

import type React from "react"
import { useState } from "react"
import { Search, ChevronDown, Plus, UserPlus } from "lucide-react"

type SearchBarProps = {
  onSearch: (query: string) => void
  onFilterChange?: (status: string) => void
  onNewProject?: () => void
  onJoinProject?: () => void
}

const SearchBar = ({ onSearch, onFilterChange, onNewProject, onJoinProject }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusOpen, setStatusOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("All Status")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setStatusOpen(false)
    if (onFilterChange) {
      onFilterChange(status)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 my-6">
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#694969]" />
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2 border border-[#ebe5eb] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a2b4a] bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 border border-[#ebe5eb] rounded-md bg-white w-full md:w-auto justify-between"
            onClick={() => setStatusOpen(!statusOpen)}
          >
            {selectedStatus}
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>

          {statusOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                {["All Status", "Active", "Completed", "On Hold", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    className="block w-full text-left px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] flex items-center justify-center"
          onClick={onJoinProject}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Join project
        </button>

        <button
          className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969] flex items-center justify-center"
          onClick={onNewProject}
        >
          <Plus className="mr-2 h-4 w-4" />
          New project
        </button>
      </div>
    </div>
  )
}

export default SearchBar
