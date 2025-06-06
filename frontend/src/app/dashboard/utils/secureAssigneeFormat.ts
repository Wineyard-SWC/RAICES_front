export const getAssigneeName = (assignee: any): string => {
  if (!assignee) return "Unknown User"
  
  // Formato { users: [id, name] }
  if (assignee.users && Array.isArray(assignee.users)) {
    if (assignee.users.length >= 2) return assignee.users[1] || assignee.users[0] || "Unknown User"
    if (assignee.users.length === 1) return assignee.users[0] || "Unknown User"
  }
  
  // Formato { id, name }
  if (assignee.name) return assignee.name
  if (assignee.id) return assignee.id
  
  // Formato [id, name]
  if (Array.isArray(assignee)) {
    if (assignee.length >= 2) return assignee[1] || assignee[0] || "Unknown User"
    if (assignee.length === 1) return assignee[0] || "Unknown User"
  }

  if (typeof assignee === 'string') return assignee
  // Fallback
  return "Unknown User"
}

export const getAssigneeId = (assignee: any): string => {
  if (!assignee) return ""
  
  // Formato { users: [id, name] }
  if (assignee.users && Array.isArray(assignee.users) && assignee.users.length > 0) {
    return assignee.users[0] || ""
  }
  
  // Formato { id, name }
  if (assignee.id) return assignee.id
  
  // Formato [id, name]
  if (Array.isArray(assignee) && assignee.length > 0) {
    return assignee[0] || ""
  }
  
  return ""
}