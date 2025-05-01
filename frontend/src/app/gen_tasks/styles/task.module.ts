export const taskStyles = {
    // Card styles
    card: "rounded-lg border p-4 transition-all hover:shadow-md",
    cardHigh: "bg-red-50 border-red-200",
    cardMedium: "bg-yellow-50 border-yellow-200",
    cardLow: "bg-green-50 border-green-200",
    cardSelected: "ring-2 ring-[#4A2B4D] ring-offset-2",
  
    // Card elements
    header: "flex justify-between items-start mb-2",
    title: "font-medium text-[#4A2B4D] line-clamp-1",
    description: "text-sm text-gray-600 line-clamp-2 mb-3",
    footer: "flex flex-wrap items-center gap-2 mt-auto",
  
    // Badges
    badge: "px-2 py-0.5 rounded-full text-xs font-medium",
    badgeHigh: "bg-red-100 text-red-700",
    badgeMedium: "bg-yellow-100 text-yellow-700",
    badgeLow: "bg-green-100 text-green-700",
  
    // Status badges
    statusTodo: "bg-gray-100 text-gray-700",
    statusInProgress: "bg-blue-100 text-blue-700",
    statusInReview: "bg-purple-100 text-purple-700",
    statusDone: "bg-green-100 text-green-700",
  
    // Points
    points: "flex items-center gap-1 text-xs font-medium text-[#4A2B4D]",
  
    // Actions
    actions: "flex items-center gap-1 -mt-1 -mr-1",
    actionButton: "p-1 rounded-full hover:bg-white/50 transition-colors",
  
    // Checkbox
    checkbox: "h-4 w-4 rounded border-gray-300 text-[#4A2B4D] focus:ring-[#4A2B4D]",
  }
  
  export const taskFormStyles = {
    form: "space-y-4",
    formGroup: "space-y-1",
    label: "block text-sm font-medium text-[#4A2B4D]",
    input: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50",
    textarea:
      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50 min-h-[100px]",
    select: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2B4D]/50",
    error: "text-xs text-red-500 mt-1",
    buttonGroup: "flex justify-end gap-3 pt-2",
    cancelButton: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
    submitButton: "px-4 py-2 bg-[#4A2B4D] text-white rounded-lg hover:bg-[#3a2239] transition-colors",
  }
  