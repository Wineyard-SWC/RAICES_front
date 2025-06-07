"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaCalendarAlt, FaUsers } from "react-icons/fa"
import { MdBarChart, MdAccessTime } from "react-icons/md"
import { MoreVertical, Edit, Trash, UserPlus, LogOut, ChevronDown, ChevronUp } from "lucide-react"
import { useKanban } from "@/contexts/unifieddashboardcontext"
import { useRequirementContext } from "@/contexts/requirementcontext"
import { useEpicContext } from "@/contexts/epiccontext"
import { useUserStoryContext } from "@/contexts/userstorycontext"
import { useSelectedRequirementContext } from "@/contexts/selectedrequirements"
import { useSelectedEpicsContext } from "@/contexts/selectedepics"
import { useSelectedUserStoriesContext } from "@/contexts/selecteduserstories"
import { useGeneratedTasks } from "@/contexts/generatedtaskscontext"
import { useUserPermissions } from "@/contexts/UserPermissions"

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
import { useProjectUsers } from "@/contexts/ProjectusersContext"
import { print, printError } from "@/utils/debugLogger"


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
  const { isOwner, isMember } = useUserProjectRole(userId, id)
  const { loadUsersIfNeeded } = useProjectUsers()
  const { setCurrentProjectPermissions, loadUserPermissionsIfNeeded } = useUserPermissions()

  const [menuOpen, setMenuOpen] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false);

  const {setRequirements} = useRequirementContext()
  const {setSelectedIds} = useSelectedRequirementContext()
  const {setEpics} = useEpicContext()
  const {setSelectedEpicIds} = useSelectedEpicsContext();
  const {setUserStories} = useUserStoryContext();
  const {setSelectedUserStoriesIds} = useSelectedUserStoriesContext();
  const {clearTasks} = useGeneratedTasks()
  const {setCurrentProject, refreshKanban} = useKanban();

  // Para formatear la fecha en tu card
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
    return new Date(dateStr).toLocaleDateString("en-US", options)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita que el click en el menú abra la tarjeta
    if ((e.target as HTMLElement).closest(".project-menu")) {
      return
    }
    
    // Guardar el ID del proyecto actual en localStorage
    localStorage.setItem("currentProjectId", id)

    print("id en project card", id)
    
    // Configurar el proyecto actual en el contexto de Kanban
    setCurrentProject(id)
    setCurrentProjectPermissions(id)
    
    // Cargar los usuarios del proyecto seleccionado
    loadUsersIfNeeded(id).then(users => {
      print(`Cargados ${users.length} usuarios para el proyecto ${id}`);
    }).catch(err => {
      printError("Error al cargar los usuarios del proyecto:", err);
    });
    
    // Cargar los permisos del usuario para este proyecto
    if (userId) {
      loadUserPermissionsIfNeeded(userId).then(() => {
        print(`Permisos cargados para el usuario en el proyecto ${id}`);
        print("Permisos bitmask son ", localStorage.getItem("userPermissionsBitmask"));
      }).catch(err => {
        printError("Error al cargar los permisos del usuario:", err);
      });
    }
    
    refreshKanban()
    setRequirements([])
    setSelectedIds([])
    setEpics([])
    setSelectedEpicIds([])
    setUserStories([])
    setSelectedUserStoriesIds([])
    clearTasks()
    router.push(`/dashboard?projectId=${id}`)    
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

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* --- CARD PRINCIPAL --- */}
      <div
        onClick={handleCardClick}
        
        className={`relative bg-white rounded-md shadow-md p-4 cursor-pointer transition-transform hover:scale-[1.02] w-full min-h-[480px] flex flex-col justify-between ${cardStyles.wrapper}`}
      >
        <div className="flex flex-col flex-grow">
          <div className={cardStyles.header}>
            <div className="min-h-[30px] max-h-[30px] overflow-hidden">
              <h2 className={cardStyles.title}>{title}</h2>
            </div>

          {/* Botón de menú */}
          <div className="project-menu relative">
            <button aria-label='moreoptions' onClick={toggleMenu} className={cardStyles.menu}>
              <MoreVertical size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                {isOwner && (
                  <button
                    onClick={handleInvite}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Invite
                  </button>
                )}

                {isOwner && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#4a2b4a] hover:bg-[#ebe5eb]"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                )}

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

        {/* Etiquetas de status y priority */}
        <div className="flex space-x-2 mt-2">
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

        {/* 
          Descripción truncada:
          - line-clamp-3 -> Sólo mostrar 3 líneas de texto.
          - overflow-hidden, text-ellipsis -> Para poner "..." cuando sobrepase.
          - break-words (o break-all) -> Para manejar cortes de palabras si la línea es muy larga.
        */}
        <div className="mt-3 relative overflow-hidden transition-all duration-300 flex-grow">
            <div className={`text-lg text-[#694969] ${isExpanded ? '' : 'line-clamp-3'}`}>
              {description}
            </div>
            
            {description.length > 200 && (
              <button
                onClick={toggleExpand}
                className="see-more-btn mt-1 text-sm text-[#4A2B4A] font-medium flex items-center hover:underline"
              >
                {isExpanded ? (
                  <>
                    See less <ChevronUp size={16} className="ml-1" />
                  </>
                ) : (
                  <>
                    See more <ChevronDown size={16} className="ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>


        {/* Barra de progreso */}
        <div className="mt-auto">
          {/* Barra de progreso */}
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

        {/* Fechas y equipo */}
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
      </div>

      {/* --- PORTAL PARA MODALES --- */}
      <Portal>
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
