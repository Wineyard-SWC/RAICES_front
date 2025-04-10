"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaCalendarAlt, FaUsers } from "react-icons/fa"
import { MdBarChart, MdAccessTime } from "react-icons/md"
import { MoreVertical, Edit, Trash, UserPlus, LogOut } from "lucide-react"

import type { Project } from "@/types/project"
import { cardStyles, statusColor, priorityColor } from "../styles/project.module"
import { useUserProjectRole } from "@/hooks/useUserProjectRole"
import { useUser } from "@/contexts/usercontext"

// Componente Portal (debes crearlo y exportarlo desde "@/components/Portal")
import { Portal } from "@/components/Portal"
import InviteCodeModal from "./invite_code_modal"
import EditProjectModal from "./edit_project_modal"
import DeleteProjectModal from "./delete_project_modal"
import LeaveProjectModal from "./leave_project_modal"

// Modales
type Props = Pick<
  Project,
  | "id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "progress"
  | "startDate"
  | "endDate"
  | "team"
  | "teamSize"
  | "tasksCompleted"
  | "totalTasks"
  | "invitationCode"
>

export default function ProjectCard({
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
  totalTasks,
  invitationCode,
}: Props) {
  const router = useRouter()
  const { userId } = useUser()
  const { isOwner, isMember, loading: loadingRole } = useUserProjectRole(userId, id)

  console.log("mis ids: ", userId, id);
  console.log("mis roles: ", isOwner, isMember);

  const [menuOpen, setMenuOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  // Para formatear la fecha en tu card
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
    return new Date(dateStr).toLocaleDateString("en-US", options)
  }

  // Si el usuario hace clic en la card (pero no en el menú)
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".project-menu")) {
      return
    }

    router.push(`/dashboard?projectId=${id}`)
    localStorage.setItem("currentProjectId", id)
  }

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const handleInvite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setShowInviteModal(true)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setShowEditModal(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setShowDeleteModal(true)
  }

  const handleLeave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setShowLeaveModal(true)
  }

  return (
    <>
      {/* --- CARD PRINCIPAL --- */}
      <div className={cardStyles.wrapper} onClick={handleCardClick}>
        <div className={cardStyles.header}>
          <h2 className={cardStyles.title}>{title}</h2>
          <div className="project-menu relative">
            <button onClick={toggleMenu} className={cardStyles.menu}>
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                <button
                  onClick={handleInvite}
                  className="flex items-center w-full px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                >
                  <UserPlus size={16} className="mr-2" />
                  Invite
                </button>

                {/* Solo mostrar Edit si es dueño */}
                {isOwner && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                )}

                {/* Mostrar "Delete" si es dueño, "Leave" si es miembro */}
                {isOwner ? (
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-[#ebe5eb]"
                  >
                    <Trash size={16} className="mr-2" />
                    Delete
                  </button>
                ) : (
                  isMember && (
                    <button
                      onClick={handleLeave}
                      className="flex items-center w-full px-4 py-2 text-sm text-amber-600 hover:bg-[#ebe5eb]"
                    >
                      <LogOut size={16} className="mr-2" />
                      Leave project
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <span
            className={`${cardStyles.badge} ${statusColor[status as "Active" | "Completed" | "On Hold"]}`}
          >
            {status}
          </span>
          <span
            className={`${cardStyles.badge} ${priorityColor[priority as "High" | "Medium" | "Low"]}`}
          >
            {priority}
          </span>
        </div>

        <p className={cardStyles.description}>{description}</p>

        <div>
          <p className={cardStyles.progressLabel}>Progress</p>
          <div className={cardStyles.progressBarContainer}>
            <div
              className={cardStyles.progressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={cardStyles.progressPercent}>{progress}%</p>
        </div>

        <div className={cardStyles.infoRow}>
          <div className={cardStyles.infoBlock}>
            <FaCalendarAlt className="text-[#4A2B4A]" />
            <div>
              <p className={cardStyles.infoLabel}>Timeline</p>
              <p className={cardStyles.infoValue}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </div>
          <div className={cardStyles.infoBlock}>
            <FaUsers className="text-[#4A2B4A]" />
            <div>
              <p className={cardStyles.infoLabel}>Team</p>
              <p className={cardStyles.infoValue}>
                {team} ({teamSize})
              </p>
            </div>
          </div>
        </div>

        <div className={cardStyles.footer}>
          <div className={cardStyles.footerItem}>
            <MdBarChart className="text-[#4A2B4A]" />
            <div>
              <p className={cardStyles.infoLabel}>Tasks</p>
              <p className={cardStyles.footerValue}>
                {tasksCompleted}/{totalTasks}
              </p>
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

      {/* --- PORTAL PARA MODALES --- */}
      <Portal>
        {/* 
          Cada modal se renderiza en el portal y comprueba 
          si debe mostrarse o no internamente con "if (!isOpen) return null"
        */}

        <InviteCodeModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          invitationCode={invitationCode}
          projectTitle={title}
        />

        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={{
            id,
            title,
            description,
            status,
            priority,
            startDate,
            endDate,
            invitationCode,
            progress,
            tasksCompleted,
            totalTasks,
            team,
            teamSize,
          }}
        />

        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          projectId={id}
          projectTitle={title}
        />

        <LeaveProjectModal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          projectId={id}
          projectTitle={title}
        />
      </Portal>
    </>
  )
}
