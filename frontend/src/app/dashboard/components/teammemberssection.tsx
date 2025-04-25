import React from "react";
import TeamMemberCard from "./teammembercard";
import { AddTeamMemberCard } from "./addteammembercard";

const teamData = [
  {
    name: "Sarah Chen",
    role: "Developer",
    avatarUrl: "https://cdn-icons-png.flaticon.com/512/921/921071.png",
    capacityHours: 40,
    usedHours: 24,
  },
  {
    name: "Mike Johnson",
    role: "Developer",
    avatarUrl: "https://cdn-icons-png.flaticon.com/512/921/921071.png",
    capacityHours: 35,
    usedHours: 20,
  },
  {
    name: "Emma Wilson",
    role: "UI Designer",
    avatarUrl: "https://cdn-icons-png.flaticon.com/512/921/921071.png",
    capacityHours: 40,
    usedHours: 32,
  },
  {
    name: "John Smith",
    role: "QA Engineer",
    avatarUrl: "https://cdn-icons-png.flaticon.com/512/921/921071.png",
    capacityHours: 30,
    usedHours: 18,
  },
];

export const TeamMembersSection = () => {
  return (
    <div className="bg-[#F5F0F1] min-h-screen p-16 mt-10">
      <h1 className="text-black font-semibold text-2xl mb-6">Team Members</h1>

      <div className="flex flex-wrap gap-6">
        {teamData.map((member, idx) => (
          <TeamMemberCard key={idx} {...member} />
        ))}
        <AddTeamMemberCard />
      </div>
    </div>
  );
};