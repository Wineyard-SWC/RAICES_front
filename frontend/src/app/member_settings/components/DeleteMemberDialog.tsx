"use client"

import { Button } from "@/components/ui/button"
import { Loader2, UserX } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/settings/components/ui/dialog"

interface DeleteMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  memberName?: string
  isLoading?: boolean
}

export default function DeleteMemberDialog({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  isLoading = false
}: DeleteMemberDialogProps) {
  
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {memberName ? `"${memberName}"` : "this member"} from the project? 
            They will lose all access to the project and this action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
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
  )
}