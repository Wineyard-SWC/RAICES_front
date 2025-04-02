'use client';
import { Project } from "@/types/project";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { MdBarChart, MdAccessTime } from "react-icons/md";
import { cardStyles, statusColor, priorityColor } from "../styles/project.module";


type Props = Pick<Project,
  | 'id'
  | 'title'
  | 'description'
  | 'status'
  | 'priority'
  | 'progress'
  | 'startDate'
  | 'endDate'
  | 'team'
  | 'teamSize'
  | 'tasksCompleted'
  | 'totalTasks'
>;

const ProjectCard = ({
  id,
  title,
  description,
  status,
  priority,
  progress,
  startDate,
  endDate,
  team,
  teamSize,
  tasksCompleted,
  totalTasks
}: Props) => {
    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
        return new Date(dateStr).toLocaleDateString("en-US", options);
      };
    
      return (
        <div className={cardStyles.wrapper}>
          <div className={cardStyles.header}>
            <h2 className={cardStyles.title}>{title}</h2>
            <div className={cardStyles.menu}>⋮</div>
          </div>
    
          <div className="flex space-x-2">
            <span className={`${cardStyles.badge} ${statusColor[status]}`}>{status}</span>
            <span className={`${cardStyles.badge} ${priorityColor[priority]}`}>{priority}</span>
          </div>
    
          <p className={cardStyles.description}>{description}</p>
    
          <div>
            <p className={cardStyles.progressLabel}>Progress</p>
            <div className={cardStyles.progressBarContainer}>
              <div className={cardStyles.progressBar} style={{ width: `${progress}%` }}></div>
            </div>
            <p className={cardStyles.progressPercent}>{progress}%</p>
          </div>
    
          <div className={cardStyles.infoRow}>
            <div className={cardStyles.infoBlock}>
              <FaCalendarAlt className="text-[#4A2B4A]" />
              <div>
                <p className={cardStyles.infoLabel}>Timeline</p>
                <p className={cardStyles.infoValue}>{formatDate(startDate)} - {formatDate(endDate)}</p>
              </div>
            </div>
            <div className={cardStyles.infoBlock}>
              <FaUsers className="text-[#4A2B4A]" />
              <div>
                <p className={cardStyles.infoLabel}>Team</p>
                <p className={cardStyles.infoValue}>{team} ({teamSize})</p>
              </div>
            </div>
          </div>
    
          <div className={cardStyles.footer}>
            <div className={cardStyles.footerItem}>
              <MdBarChart className="text-[#4A2B4A]" />
              <div>
                <p className={cardStyles.infoLabel}>Tasks</p>
                <p className={cardStyles.footerValue}>{tasksCompleted}/{totalTasks}</p>
              </div>
            </div>
            <div className={cardStyles.footerItem}>
              <MdAccessTime className="text-[#4A2B4A]" />
              <div>
                <p className={cardStyles.infoLabel}>Completion</p>
                <p className={cardStyles.footerValue}>{progress}%</p>
              </div>
            </div>
          </div>
        </div>
      );
};

export default ProjectCard;
