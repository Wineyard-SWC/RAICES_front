"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { permissions } from "@/lib/permissions"

interface RoleFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => Promise<void>
  isEditing: boolean
  isSubmitting: boolean
  roleName: string
  roleDescription: string
  rolePermissions: number
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onPermissionChange: (bit: number, checked: boolean) => void
  hasPermission: (bitmask: number, bit: number) => boolean
}

export default function RoleFormDialog({
  isOpen,
  onClose,
  onSave,
  isEditing,
  isSubmitting,
  roleName,
  roleDescription,
  rolePermissions,
  onNameChange,
  onDescriptionChange,
  onPermissionChange,
  hasPermission
}: RoleFormDialogProps) {

  const handleSave = async () => {
    await onSave()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px] w-[95%]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Role" : "Create New Role"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify the role details and permissions"
              : "Define a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="E.g., Project Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={roleDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="E.g., Manages the project and coordinates the team"
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="rounded-md border border-gray-200 p-4 max-h-[50vh] overflow-y-auto">
              <p className="text-sm text-gray-500 mb-4">
                Select the permissions for this role.
              </p>
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={hasPermission(rolePermissions, permission.bit)}
                      onCheckedChange={(checked) =>
                        onPermissionChange(permission.bit, checked === true)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`permission-${permission.id}`} className="text-sm font-medium">
                        {permission.name}
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
            onClick={handleSave}
            disabled={isSubmitting || !roleName.trim()}
          >
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}