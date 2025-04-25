import React from "react";
import { Plus } from "lucide-react";

export const AddTeamMemberCard = () => {
  return (
    <div className="flex flex-col items-center justify-center w-[25vw] h-[20vh] bg-white border-2 border-[#4A2B4A] rounded-xl shadow-sm cursor-pointer hover:bg-[#f0e7f0] transition">
      <Plus className="text-[#4A2B4A]" size={32} />
      <p className="text-[#4A2B4A] mt-2 font-medium">Add Team Member</p>
    </div>
  );
};
