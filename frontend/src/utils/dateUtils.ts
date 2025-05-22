export function formatDate(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

export function getDaysRemaining(endDateString: string): number {
  const endDate = new Date(endDateString)
  const today = new Date()
  
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

export function getSprintDuration(startDateString: string, endDateString: string): number {
  const startDate = new Date(startDateString)
  const endDate = new Date(endDateString)
  
  const diffTime = endDate.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}