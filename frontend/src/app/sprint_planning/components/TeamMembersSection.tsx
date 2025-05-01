"use client";

import type { SprintMember } from "@/types/sprint";
import TeamMemberCard   from "./TeamMemberCard";
import AddTeamMemberCard from "./AddTeamMemberCard";

interface Props {
  projectId: string;
  ownerId:   string | undefined;
  members:   SprintMember[];
  onAdd:     (m: SprintMember) => void;
  onUpdate:  (id: string, data: Partial<SprintMember>) => void;
  onRemove:  (id: string) => void;
}

export default function TeamMembersSection({
  projectId,
  ownerId,
  members,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <div className="mt-6">
      <h3 className="mb-3 font-bold">Team Members</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {members.map(mem => (
          <TeamMemberCard
            key={mem.id}
            member={mem}
            ownerId={ownerId}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}

        <AddTeamMemberCard
          projectId={projectId}
          already={members}   // para filtrar duplicados
          onAdd={onAdd}
        />
      </div>
    </div>
  );
}
