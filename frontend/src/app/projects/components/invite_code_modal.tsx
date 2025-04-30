"use client"

import { useState } from "react"
import { X, Copy, Check } from "lucide-react"

interface InviteCodeModalProps {
  isOpen: boolean
  onClose: () => void
  invitationCode: string
  projectTitle: string
}

const InviteCodeModal = ({ isOpen, onClose, invitationCode, projectTitle }: InviteCodeModalProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-[#ebe5eb]">
          <h2 className="text-xl font-semibold text-[#4a2b4a]">Invite to Project</h2>
          <button onClick={onClose} className="text-[#694969] hover:text-[#4a2b4a]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[#694969] mb-4">
            Share this invitation code so others can join <strong>{projectTitle}</strong>:
          </p>

          <div className="flex items-center">
            <div className="flex-1 bg-[#ebe5eb] p-3 rounded-l-md font-mono text-[#4a2b4a] font-semibold">
              {invitationCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-[#4a2b4a] text-white p-3 rounded-r-md hover:bg-[#694969] transition-colors"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          {copied && <p className="text-green-600 text-sm mt-2">Code copied to clipboard!</p>}

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-[#4a2b4a] text-white rounded-md hover:bg-[#694969]">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteCodeModal
