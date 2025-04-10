"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { useDeleteProject } from "@/hooks/useDeleteProject"

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
}

const DeleteProjectModal = ({ isOpen, onClose, projectId, projectTitle }: DeleteProjectModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { deleteProject, error } = useDeleteProject()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const success = await deleteProject(projectId)
      if (success) {
        setSuccessMessage("Proyecto eliminado correctamente")
        setTimeout(() => {
          onClose()
          // Recargar la página para actualizar la lista de proyectos
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">Eliminar proyecto</h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4 text-amber-600">
            <AlertTriangle size={24} className="mr-2" />
            <h3 className="text-lg font-medium">¿Estás seguro?</h3>
          </div>

          <p className="text-[#694969] mb-4">
            Estás a punto de eliminar el proyecto <strong>"{projectTitle}"</strong>. Esta acción no se puede deshacer y
            se eliminarán todos los datos asociados.
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#ebe5eb] rounded-md text-[#694969] hover:bg-[#ebe5eb]"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={isDeleting || !!successMessage}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectModal
