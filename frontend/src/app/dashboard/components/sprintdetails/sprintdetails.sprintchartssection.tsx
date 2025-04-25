import { ChartCard} from "./sprintdetails.chartcard"

const SprintChartsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <ChartCard title="Burndown Chart" />
      <ChartCard title="Velocity Trend" />
    </div>
  )
}

export default SprintChartsSection