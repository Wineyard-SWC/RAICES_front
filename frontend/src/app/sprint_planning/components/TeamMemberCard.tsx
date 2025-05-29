"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Progress } from "@/components/progress";
import type { SprintMember } from "@/types/sprint";
import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
import { User } from "lucide-react";


interface Props {
  member: SprintMember & { fixed?: boolean };
  onUpdate: (id: string, d: Partial<SprintMember>) => void;
  onRemove: (id: string) => void;
  isEditable?: boolean;
  ownerId?: string;
}

export default function TeamMemberCard({
  member,
  onUpdate,
  onRemove,
  isEditable = true,
  ownerId,
}: Props) {
  const locked = member.fixed || member.id === ownerId;
  const cap = member.capacity ?? 0;
  const used = member.allocated ?? 0;
  const percent = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;

  return (
    <div className="relative rounded border border-gray-200 bg-white p-3 mb-6">
      {isEditable && !locked && (
        <button
          onClick={() => onRemove(member.id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
          aria-label="Remove member"
        >
          <X className="h-3 w-3 text-gray-500" />
        </button>
      )}

      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-[#ebe5eb] overflow-hidden mr-3">
          {member.avatar ? (
            <AvatarProfileIcon 
              avatarUrl={member.avatar} 
              size={40} 
              borderWidth={2}
              borderColor="#4a2b4a"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-[#4a2b4a] text-white">
              {member?.name?.charAt(0).toUpperCase() || <User size={16} />}
            </div>
          )}
        </div>
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-xs text-gray-500">{member.role}</div>
        </div>
      </div>

      {cap > 0 && (
        <>
          <div className="mt-2 flex justify-between text-xs">
            <span>Capacity: {cap} h</span>
            <span>
              {used}h / {cap}h
            </span>
          </div>

          <Progress
            value={percent}
            className="mt-1 h-2 bg-gray-200"
            indicatorClassName={
              percent > 90
                ? "bg-red-500"
                : percent > 70
                ? "bg-yellow-500"
                : "bg-[#4a2b4a]"
            }
          />
        </>
      )}
    </div>
  );
}
