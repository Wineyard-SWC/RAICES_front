"use client"

import { useState, useEffect } from "react"
import { useUserRoles } from "@/contexts/userRolesContext"
import { useUser } from "@/contexts/usercontext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/card"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"



import useToast from "@/hooks/useToast"
import { Check, ChevronDown, Loader2, MoreHorizontal, Shield, ShieldAlert, ShieldCheck, Trash2, UserX } from "lucide-react"
import { Badge } from "@/app/settings/components/ui/badge"
import { useProjectUsers } from "@/contexts/ProjectusersContext"
import { Dialog, DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, } from "@/app/settings/components/ui/dialog"

import { DropdownMenu, DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, } from "./Dropdown"
import { useUserPermissions } from "@/contexts/UserPermissions"

// URLs de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function MembersTab() {
  const { userId } = useUser();
  const { getUsersForProject, loadUsersIfNeeded, refreshUsers, isLoading } = useProjectUsers();
  const { userRoles } = useUserRoles();
  const { showToast } = useToast();
  const { hasPermission, getCurrentBitmask } = useUserPermissions();
  
  const [currentProjectId, setCurrentProjectId] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [memberToEditId, setMemberToEditId] = useState<string | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const PERMISSIONS = {
    MEMBER_MANAGE: 1 << 1,
  };

  // Obtener el ID del proyecto actual
  useEffect(() => {
    const storedProjectId = localStorage.getItem("currentProjectId");
    if (storedProjectId) {
      setCurrentProjectId(storedProjectId);
      // Cargar usuarios del proyecto
      loadUsersIfNeeded(storedProjectId);
    }
  }, [currentProjectId]);
  
  // Obtener la lista de miembros del proyecto
  const members = getUsersForProject(currentProjectId);
  
  // Ordenar miembros (usuario actual primero)
  const sortedMembers = [...members].sort((a, b) => {
    // El usuario actual va primero
    if (a.userRef === userId) return -1;
    if (b.userRef === userId) return 1;
    // Luego ordenar por role
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (b.role === "owner" && a.role !== "owner") return 1;
    // Finalmente ordenar por nombre
    return a.name.localeCompare(b.name);
  });
  
  // Función para obtener la relación usuario-proyecto
  const getProjectUserRelation = async (userId: string, projectId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/project_users/relation?user_id=${userId}&project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Error fetching project-user relation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting project-user relation:', error);
      throw error;
    }
  };
  
  // Función para eliminar un miembro del proyecto
  const deleteMember = async (memberUserId: string) => {
    if (!currentProjectId || !memberUserId) return;
    
    setIsDeleting(true);
    try {
      // Primero obtenemos la relación para conseguir el ID
      const relation = await getProjectUserRelation(memberUserId, currentProjectId);
      const relationId = relation.id;
      
      // Ahora eliminamos la relación
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/project_users/${relationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove member from project');
      }
      
      showToast("Member removed successfully", "success");
      
      // Refrescar la lista de miembros
      await refreshUsers(currentProjectId);
      
      // Cerrar el diálogo
      setIsDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      showToast("Failed to remove member", "error");
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Función para actualizar el rol de un miembro
  const updateMemberRole = async (memberUserId: string, newRole: string) => {
    if (!currentProjectId || !memberUserId) return;
    
    setIsUpdatingRole(true);
    try {
      // Primero obtenemos la relación para conseguir el ID
      const relation = await getProjectUserRelation(memberUserId, currentProjectId);
      const relationId = relation.id;
      
      // Ahora actualizamos el rol
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/project_users/${relationId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update member role');
      }
      
      showToast("Role updated successfully", "success");
      
      // Refrescar la lista de miembros
      await refreshUsers(currentProjectId);
      
      // Limpiar estado de edición
      setMemberToEditId(null);
      setSelectedRoleName("");
    } catch (error) {
      console.error('Error updating role:', error);
      showToast("Failed to update role", "error");
    } finally {
      setIsUpdatingRole(false);
    }
  };
  
  // Función para mostrar el ícono del rol
  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return <ShieldAlert className="h-4 w-4 text-purple-500" />;
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Función para abrir el diálogo de confirmación de eliminación
  const confirmDeleteMember = (memberId: string) => {
    // Asegurarse de que cualquier dropdown abierto se haya cerrado
    setMemberToDelete(memberId);
    // Dar tiempo para que otros diálogos se cierren
    setTimeout(() => {
      setIsDeleteDialogOpen(true);
    }, 100);
  };
  
  // Verificar si un usuario puede ser editado
  const canEditMember = (memberRole: string, memberUserId: string) => {
    // 1. Verificar si el usuario tiene el permiso específico
    const hasMemberManagePermission = hasPermission(PERMISSIONS.MEMBER_MANAGE);
    
    if (!hasMemberManagePermission) {
      return false; // No tiene permiso para gestionar miembros
    }
    
    // 2. No se puede editar el propietario o a uno mismo (regla de negocio)
    if (memberRole === "owner" || memberUserId === userId) {
      return false;
    }
    
    return true;
  };
  
  // Roles disponibles para asignar (excluyendo 'owner')
  const availableRoles = userRoles?.roles?.filter(role => 
    role.name.toLowerCase() !== "owner"
  ) || [];
  
  // Comprobar si hay datos cargando
  if (isLoading(currentProjectId)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#4a2b4a]" />
        <span className="ml-2 text-lg">Loading members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Opcional: Mostrar mensaje si no tiene permisos */}
      {!hasPermission(PERMISSIONS.MEMBER_MANAGE) && (
        <div className="bg-amber-50 border border-amber-200 p-3 mb-4 rounded-md">
          <p className="text-amber-800 text-sm">
            You don't have permissions to manage project members.
            Contact the project owner if you need to make changes.
          </p>
        </div>
      )}
      
      {/* Lista de miembros */}
      <div className="grid gap-4">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member) => (
            <Card key={member.userRef} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar del usuario */}
                  <div className="relative">
                    {member.avatarUrl ? (
                      <AvatarProfileIcon 
                        avatarUrl={member.avatarUrl} 
                        size={48} 
                        borderWidth={2}
                        borderColor="#C7A0B8"
                        backgroundColor="#4891E0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[#4891E0] border-2 border-[#C7A0B8] flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    
                    {/* Indicador de usuario actual */}
                    {member.userRef === userId && (
                      <Badge className="absolute -bottom-1 -right-1 bg-[#4a2b4a] text-[10px] px-1">
                        You
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Rol actual con su ícono */}
                  <div className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    <span className="text-sm font-medium">
                      {member.role || "Member"}
                    </span>
                  </div>
                  
                  {/* Menú de acciones condicional basado en permisos */}
                  {canEditMember(member.role, member.userRef) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          disabled={isUpdatingRole} 
                          onClick={() => {
                            // Cerrar el dropdown antes de abrir el diálogo
                            // para evitar problemas de foco
                            setTimeout(() => {
                              setMemberToEditId(member.userRef);
                            }, 100);
                          }}
                        >
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => {
                            // Cerrar el dropdown primero antes de mostrar el diálogo
                            setTimeout(() => {
                              confirmDeleteMember(member.userRef);
                            }, 100);
                          }}
                          disabled={isDeleting}
                        >
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-md shadow-sm">
            <p className="text-gray-500">No members found in this project.</p>
          </div>
        )}
      </div>

      {/* Diálogo para cambiar el rol */}
      {memberToEditId && (
        <Dialog open={!!memberToEditId} onOpenChange={(open) => !open && setMemberToEditId(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Member Role</DialogTitle>
              <DialogDescription>
                Select a new role for this team member.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedRoleName || "Select a role"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {availableRoles.map((role) => (
                    <DropdownMenuItem 
                      key={role.idRole}
                      onClick={() => setSelectedRoleName(role.name)}
                      className="flex items-center justify-between"
                    >
                      {role.name}
                      {selectedRoleName === role.name && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setMemberToEditId(null)}
                disabled={isUpdatingRole}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateMemberRole(memberToEditId, selectedRoleName)}
                disabled={!selectedRoleName || isUpdatingRole}
                className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
              >
                {isUpdatingRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmación para eliminar miembro */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the project? They will lose all access to the project.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setMemberToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => memberToDelete && deleteMember(memberToDelete)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Remove Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}