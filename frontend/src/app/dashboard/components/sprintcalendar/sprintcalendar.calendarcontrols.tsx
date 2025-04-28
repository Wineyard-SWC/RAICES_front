import { Search, ChevronDown } from "lucide-react"
import {styles} from "../../styles/calendarstyles"
import { Dispatch, SetStateAction } from "react"

interface Props {
    viewMode: "week" | "month"
    setViewMode: Dispatch<SetStateAction<"week" | "month">>
    day: string;
}

const CalendarControls = ({ viewMode, setViewMode, day }: Props) => (
  <div className="flex flex-wrap justify-between items-center mb-4">
    <div className="flex space-x-2 mb-2 sm:mb-0">
      {["week", "month"].map(mode => (
        <button
          key={mode}
          className={viewMode === mode ? styles.calendarButtonActive : styles.calendarButtonInactive}
          onClick={() => setViewMode(mode as "week" | "month")}
        >
          {mode === "week" ? "Week View" : "Team View"}
        </button>
      ))}
      <p className="px-3 py-1 rounded text-m ">{day}</p>
    </div>

    <div className="flex space-x-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Search tasks..." className={styles.calendarInput} />
      </div>
      <button className={styles.calendarDropdown}>
        All Tasks
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>
    </div>
  </div>
)

export default CalendarControls
