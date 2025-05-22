"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Edit, Trash2, ChevronDown, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/card"
import { Input } from "@/components/ui/input"

import { Checkbox } from "@/components/ui/checkbox"
import { permissions } from "@/lib/permissions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { useUserRoles } from "@/contexts/userRolesContext"
import useToast from "@/hooks/useToast"
import ConfirmDialog from "@/components/confimDialog" // Importamos el componente de confirmación

// Reemplaza react-hot-toast con tu hook personalizado
// Tipo para roles como los maneja el frontend
interface FrontendRole {
  id: string;
  name: string;
  description: string;
  bitmask: number;
  isDefault: boolean;
}

// Tipo para roles como los maneja la API
interface ApiRole {
  idRole: string;
  name: string;
  description?: string;
  bitmask: number;
  is_default: boolean;
}

// Check if a permission is active in a bitmask
const hasPermission = (bitmask: number, permissionBit: number) => {
  return (bitmask & permissionBit) === permissionBit
}


// Función para convertir roles del formato API al formato Frontend
const apiToFrontendRole = (role: ApiRole): FrontendRole => ({
  id: role.idRole,
  name: role.name,
  description: role.description || '',
  bitmask: role.bitmask,
  isDefault: role.is_default
})

// Función para convertir roles del formato Frontend al formato API
const frontendToApiRole = (role: FrontendRole): ApiRole => ({
  idRole: role.id,
  name: role.name,
  description: role.description,
  bitmask: role.bitmask,
  is_default: role.isDefault
})

export default function RolesTab() {
  const { userRoles, updateUserRoles } = useUserRoles();
  const { showToast } = useToast();
  
  const [roles, setRoles] = useState<FrontendRole[]>([])
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [newRolePermissions, setNewRolePermissions] = useState(0)
  const [isNewRoleDialogOpen, setIsNewRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Estados para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)

  // Cargar roles desde el contexto cuando esté disponible
  useEffect(() => {
    if (userRoles && userRoles.roles) {
      setRoles(userRoles.roles.map(apiToFrontendRole))
    }
  }, [userRoles])

  // Function to toggle role expansion
  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }))
  }

  // Function to handle permission changes for a new role
  const handlePermissionChange = (permissionBit: number, checked: boolean) => {
    if (checked) {
      setNewRolePermissions(newRolePermissions | permissionBit)
    } else {
      setNewRolePermissions(newRolePermissions & ~permissionBit)
    }
  }

  // Función para actualizar los roles en el backend
  const saveRolesToBackend = async (updatedRoles: FrontendRole[]) => {
    if (!userRoles?.id) {
      // Reemplazar toast.error con showToast
      showToast("No se puede actualizar: documento de roles no encontrado", "error");
      return false;
    }

    setIsSubmitting(true);

    try {
      // Convertir roles al formato que espera la API
      const apiRoles = updatedRoles.map(frontendToApiRole);
      
      // Llamar a la función del contexto para actualizar
      const success = await updateUserRoles(apiRoles);
      
      if (success) {
        // Reemplazar toast.success con showToast
        showToast("Roles actualizados correctamente", "success");
        return true;
      } else {
        // Reemplazar toast.error con showToast
        showToast("Error al actualizar roles", "error");
        return false;
      }
    } catch (error) {
      console.error("Error actualizando roles:", error);
      // Reemplazar toast.error con showToast
      showToast("Error al actualizar roles", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to create a new role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return

    const newRole: FrontendRole = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      description: newRoleDescription,
      bitmask: newRolePermissions,
      isDefault: false,
    }

    const updatedRoles = [...roles, newRole]
    
    // Guardar en el backend
    const success = await saveRolesToBackend(updatedRoles)
    
    if (success) {
      setRoles(updatedRoles)
      setNewRoleName("")
      setNewRoleDescription("")
      setNewRolePermissions(0)
      setIsNewRoleDialogOpen(false)
    }
  }

  // Modificado: Función para mostrar diálogo de confirmación de eliminación 
  const showDeleteConfirmation = (roleId: string) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    if (roleToDelete) {
      setRoleToDelete(roleId);
      setIsDeleteDialogOpen(true);
    }
  }

  // Modificado: Función para ejecutar la eliminación después de confirmar
  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    
    const updatedRoles = roles.filter((role) => role.id !== roleToDelete);
    const success = await saveRolesToBackend(updatedRoles);
    
    if (success) {
      setRoles(updatedRoles);
    }
    
    // Cerrar el diálogo de confirmación
    setIsDeleteDialogOpen(false);
    setRoleToDelete(null);
  }

  // Function to edit an existing role
  const handleEditRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role) {
      setNewRoleName(role.name)
      setNewRoleDescription(role.description)
      setNewRolePermissions(role.bitmask)
      setEditingRole(roleId)
      setIsNewRoleDialogOpen(true)
    }
  }

  // Function to save an edited role
  const handleSaveEditedRole = async () => {
    if (!editingRole || !newRoleName.trim()) return

    const updatedRoles = roles.map((role) => {
      if (role.id === editingRole) {
        return {
          ...role,
          name: newRoleName,
          description: newRoleDescription,
          bitmask: newRolePermissions,
        }
      }
      return role
    })

    // Guardar en el backend
    const success = await saveRolesToBackend(updatedRoles)
    
    if (success) {
      setRoles(updatedRoles)
      setNewRoleName("")
      setNewRoleDescription("")
      setNewRolePermissions(0)
      setEditingRole(null)
      setIsNewRoleDialogOpen(false)
    }
  }

  // Componente de confirmación para eliminar rol
  const deleteConfirmDialog = (
    <ConfirmDialog
      open={isDeleteDialogOpen}
      title="Confirm Role Deletion"
      message={`Are you sure you want to delete this role? This action cannot be undone.`}
      onCancel={() => {
        setIsDeleteDialogOpen(false);
        setRoleToDelete(null);
      }}
      onConfirm={confirmDeleteRole}
      cancelText="Cancel"
      confirmText="Delete Role"
      isLoading={isSubmitting}
    />
  );

  return (
    <div className="space-y-6">
      {/* Añadimos el diálogo de confirmación */}
      {deleteConfirmDialog}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Roles</h2>
        <Dialog open={isNewRoleDialogOpen} onOpenChange={setIsNewRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969]">
              <Plus className="mr-2 h-4 w-4" /> New Role
            </Button>
          </DialogTrigger>
          {/* Modificado: Aumentamos el tamaño del diálogo */}
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px] w-[95%]">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                {editingRole
                  ? "Modify the role details and permissions"
                  : "Define a new role with specific permissions"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="E.g., Project Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="E.g., Manages the project and coordinates the team"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                {/* Aumentamos también el tamaño de la sección de permisos */}
                <div className="rounded-md border border-gray-200 p-4 max-h-[50vh] overflow-y-auto">
                  <p className="text-sm text-gray-500 mb-4"> 
                    Select the permissions for this role.
                  </p>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={hasPermission(newRolePermissions, permission.bit)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(permission.bit, checked === true)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={`permission-${permission.id}`} className="text-sm font-medium">
                            {permission.code}
                          </Label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewRoleDialogOpen(false)
                  setEditingRole(null)
                  setNewRoleName("")
                  setNewRoleDescription("")
                  setNewRolePermissions(0)
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                onClick={editingRole ? handleSaveEditedRole : handleCreateRole}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>{role.name}</CardTitle>
                  {role.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500"
                    onClick={() => toggleRoleExpansion(role.id)}
                  >
                    {expandedRoles[role.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  {!role.isDefault && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-500"
                        onClick={() => handleEditRole(role.id)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => showDeleteConfirmation(role.id)} // Cambiado para mostrar confirmación
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            {expandedRoles[role.id] && (
              <CardContent>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`flex items-center gap-2 rounded-md p-2 ${
                        hasPermission(role.bitmask, permission.bit) ? "bg-green-50" : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          hasPermission(role.bitmask, permission.bit) ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-medium">{permission.code}</p>
                        <p className="text-xs">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}