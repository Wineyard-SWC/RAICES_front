// New component for displaying a meeting/event
const EventCard = ({ event }: { event: EventData }) => {
  // Format times for display
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  }
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }
  
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mb-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-800 text-sm">{event.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full text-white ${getPriorityColor(event.priority)}`}>
          {event.priority}
        </span>
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(event.start_date)} - {formatTime(event.end_date)}
        </div>
        
        {event.location && (
          <div className="flex items-center mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {event.location}
          </div>
        )}
      </div>
      
      {event.participants && event.participants.length > 0 && (
        <div className="mt-2 flex items-center">
          <Users className="h-3 w-3 mr-1" />
          <span className="text-xs text-gray-500">{event.participants.length} participants</span>
        </div>
      )}
    </div>
  )
}