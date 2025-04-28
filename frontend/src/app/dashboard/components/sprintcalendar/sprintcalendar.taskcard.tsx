interface Props {
    title: string
    type: string
    time: string
    borderColor: string
  }
  
const CalendarTaskCard = ({ title, type, time, borderColor }: Props) => (
    <div className={`mb-2 bg-white rounded-lg shadow-sm p-2 border-l-4 ${borderColor}`}>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold">{title}</span>
        <span className={`text-xs ${borderColor.replace('border-', 'bg-')} text-white px-1 rounded`}>{type}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{time}</span>
        <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
          <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
    </div>
)
  
export default CalendarTaskCard
  