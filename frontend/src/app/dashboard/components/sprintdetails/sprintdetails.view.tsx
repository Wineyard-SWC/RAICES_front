import MetricCard from "./sprintdetails.metriccard"
import SprintChartsSection from "./sprintdetails.sprintchartssection"
import { SprintTaskCard } from "./sprintdetails.taskcard"
import { Calendar, Clock, BarChart2, User } from "lucide-react"
import { ArrowLeft } from "lucide-react"


type Props = {
    onBack: () => void;
}

const SprintDetailsPage = ({ onBack }: Props) => {
  return (
    <div className="">
        {/* Header + Search Placeholder */}
        <div className="flex items-center justify-between mt-4 mb-4">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-[#1e1e1e]">Sprint Details</h1>
            </div>  
        </div>
        <div className="mb-2">
            <p className=" text-lg font-semibold text-[#694969] mt-2 mb-2">Track sprint progress and manage tasks</p>
            <button
            onClick={onBack}
            className="text-[#4A2B4A] text-sm font-medium hover:underline"
            > {"<- Go back "}
            </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
            icon={<Calendar className="text-[#4A2B4A]" />}
            title="Start Date"
            mainValue="Apr 1, 2025"
            />
            <MetricCard
            icon={<Clock className="text-[#4A2B4A]" />}
            title="End Date"
            mainValue="Apr 15, 2025"
            />
            <MetricCard
            icon={<BarChart2 className="text-[#4A2B4A]" />}
            title="Sprint Progress"
            mainValue="72%"
            progress={72}
            />
            <MetricCard
            icon={<User className="text-[#4A2B4A]" />}
            title="Team Size"
            mainValue="6 Members"
            />
        </div>

        {/*SearchBar*/}
        <div> 
            <div className="mt-8 mb-8 w-full h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
            {/* Placeholder para SearchBar */}
            SearchBar Placeholder
            </div>
        </div> 

        <div className="bg-white border border-[#D3C7D3] shadow-md rounded-xl px-4 py-4">
            {/* Chart Section */}
            <SprintChartsSection />
            
            {/* Task List */}
            <div className="space-y-4 mt-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-semibold text-black">Sprint Backlog</h2>
                    <button className="bg-[#4A2B4A] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3a2248] transition">
                    Sprint Planning
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <SprintTaskCard
                        title="Implement user authentication"
                        description="Add email/password and Google login"
                        assigneeName="Sarah Chen"
                        assigneeAvatar="https://i.pravatar.cc/100?img=48"
                        date="Apr 3"
                        status="In Progress"
                        progress={60}
                        priority="medium"
                    />
                    <SprintTaskCard
                        title="Design dashboard UI"
                        description="Wireframe & high-fidelity"
                        assigneeName="Luis Torres"
                        assigneeAvatar="https://i.pravatar.cc/100?img=33"
                        date="Apr 5"
                        status="To Do"
                        progress={10}
                        priority="high"
                    />
                    <SprintTaskCard
                        title="API Integration"
                        description="Integrate with payment gateway API"
                        assigneeName="Lisa Wong"
                        assigneeAvatar="https://i.pravatar.cc/100?img=32"
                        date="Apr 12"
                        status="To Do"
                        progress={20}
                        priority="high"
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default SprintDetailsPage