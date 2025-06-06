"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/settings/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./Dropdown"

interface Role {
  idRole: string
  name: string
}

interface EditRoleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (roleName: string) => Promise<void>
  availableRoles: Role[]
  isLoading?: boolean
  currentRole?: string
}

export default function EditRoleDialog({
  isOpen,
  onClose,
  onSave,
  availableRoles,
  isLoading = false,
  currentRole
}: EditRoleDialogProps) {
  const [selectedRoleName, setSelectedRoleName] = useState<string>(currentRole || "")

  const handleSave = async () => {
    if (selectedRoleName) {
      await onSave(selectedRoleName)
      setSelectedRoleName("")
    }
  }

  const handleClose = () => {
    setSelectedRoleName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedRoleName || isLoading}
            className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
          >
            {isLoading ? (
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
  )
}