"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/card"
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
import { MoreHorizontal, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Badge } from "@/app/settings/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./Dropdown"

interface Member {
  userRef: string
  name: string
  email: string
  role: string
  avatarUrl?: string
}

interface MemberCardProps {
  member: Member
  isCurrentUser: boolean
  canEdit: boolean
  onEditRole: (memberId: string) => void
  onDeleteMember: (memberId: string) => void
  isUpdatingRole?: boolean
  isDeleting?: boolean
}

const getRoleIcon = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'owner':
      return <ShieldAlert className="h-4 w-4 text-purple-500" />
    case 'admin':
      return <ShieldCheck className="h-4 w-4 text-blue-500" />
    default:
      return <Shield className="h-4 w-4 text-gray-500" />
  }
}

export default function MemberCard({
  member,
  isCurrentUser,
  canEdit,
  onEditRole,
  onDeleteMember,
  isUpdatingRole = false,
  isDeleting = false
}: MemberCardProps) {
  
  const handleEditRole = () => {
    setTimeout(() => {
      onEditRole(member.userRef)
    }, 100)
  }

  const handleDeleteMember = () => {
    setTimeout(() => {
      onDeleteMember(member.userRef)
    }, 100)
  }

  return (
    <Card className="p-4">
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
            {isCurrentUser && (
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
          
          {/* Menú de acciones */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  disabled={isUpdatingRole} 
                  onClick={handleEditRole}
                >
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600" 
                  onClick={handleDeleteMember}
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
  )
}