import CalendarTaskCard from "./sprintcalendar.taskcard"
import {styles} from "../../styles/calendarstyles"
import { UserStory } from "@/types/userstory"

// Modified to only include weekdays
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"]

const today = new Date()

// Helper function to get the current week's Monday as the starting point
const getMonday = () => {
  const day = today.getDay()
  // If Sunday (0) or Saturday (6), find the next Monday
  if (day === 0) {
    return new Date(today.setDate(today.getDate() + 1))
  } else if (day === 6) {
    return new Date(today.setDate(today.getDate() + 2))
  }
  // Otherwise, go back to the most recent Monday
  return new Date(today.setDate(today.getDate() - day + 1))
}

const monday = getMonday()

const getDayAndDate = (offset: number) => {
  const date = new Date(monday)
  date.setDate(monday.getDate() + offset)
  // We're using fixed workdays now (Monday to Friday)
  const dayName = daysOfWeek[offset]
  const dayNumber = date.getDate()
  return { dayName, dayNumber }
}

interface CalendarGridProps {
  backlogItems?: UserStory[]
}

// Helper function to assign backlog items to days of the week
const assignBacklogItemsToDays = (backlogItems?: UserStory[]) => {
  if (!backlogItems || backlogItems.length === 0) return {}
  
  // Simple distribution algorithm - spread items across the week
  const distribution: {[key: number]: UserStory[]} = {0: [], 1: [], 2: [], 3: [], 4: []}
  
  backlogItems.forEach((item, index) => {
    const dayIndex = index % 5 // Distribute across 5 days
    distribution[dayIndex].push(item)
  })
  
  return distribution
}

const CalendarGrid = ({ backlogItems }: CalendarGridProps) => {
  console.log("CalendarGrid received backlogItems:", backlogItems);
  const backlogDistribution = assignBacklogItemsToDays(backlogItems)
  console.log("Backlog distribution:", backlogDistribution);
  
  return (
    <>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {[...Array(5)].map((_, idx) => {
          const { dayName, dayNumber } = getDayAndDate(idx)
          return (
            <div key={idx} className={styles.calendarDayHeader}>
              <div>{dayName}</div>
              <div className="text-xs text-gray-500">{dayNumber}</div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-5 gap-2 h-96">
        {[...Array(5)].map((_, dayIndex) => (
          <div key={dayIndex} className="shadow-sm border border-[#D3C7D3] rounded-lg p-2 h-full overflow-y-auto">
            {backlogDistribution[dayIndex]?.map((item, idx) => (
              <CalendarTaskCard 
                key={`backlog-${item.id || idx}`}
                title={item.title}
                type={item.priority || "STORY"}
                time="Backlog Item"
                borderColor={item.priority?.toLowerCase() === "high" ? "border-red-500" : "border-purple-500"}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default CalendarGrid