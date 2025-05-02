"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Progress } from "@/components/progress";
import type { SprintMember } from "@/types/sprint";

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
        <img
          src={member.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png"}
          alt={member.name}
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
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
