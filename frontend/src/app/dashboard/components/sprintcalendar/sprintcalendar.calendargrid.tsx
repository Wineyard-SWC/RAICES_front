import CalendarTaskCard from "./sprintcalendar.taskcard" 
import {styles} from "../../styles/calendarstyles"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const today = new Date()

  const getDayAndDate = (offset: number) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)

    const dayName = daysOfWeek[date.getDay()]
    const dayNumber = date.getDate()

    return { dayName, dayNumber }
}

const CalendarGrid = () => (
  <>
    <div className="grid grid-cols-7 gap-2 mb-2">
        {[...Array(7)].map((_, idx) => {
          const { dayName, dayNumber } = getDayAndDate(idx)
          return (
            <div key={idx} className={styles.calendarDayHeader}>
              <div>{dayName}</div>
              <div className="text-xs text-gray-500">{dayNumber}</div>
            </div>
          )
        })}
    </div>

    <div className="grid grid-cols-7 gap-2 h-96">
      {[...Array(7)].map((_, dayIndex) => (
        <div key={dayIndex} className="shadow-sm border border-[#D3C7D3] rounded-lg p-2 h-full overflow-y-auto">
          {dayIndex < 7 && (
            <>
              <CalendarTaskCard title="Update user flow" type="Design" time="9:00 - 11:00 AM" borderColor="border-[#4A2B4D]" />
              {(dayIndex === 1 || dayIndex === 3) && (
                <CalendarTaskCard title="Team standup" type="Meeting" time="2:00 - 2:30 PM" borderColor="border-green-500" />
              )}
              {(dayIndex === 2 || dayIndex === 5) && (
                <CalendarTaskCard title="API integration" type="Dev" time="All day" borderColor="border-blue-500" />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  </>
)

export default CalendarGrid
