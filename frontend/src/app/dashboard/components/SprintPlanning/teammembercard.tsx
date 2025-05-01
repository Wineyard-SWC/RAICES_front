import React from "react";
import { BarChart3 } from "lucide-react";

type Props = {
  name: string;
  role: string;
  avatarUrl: string;
  capacityHours: number;
  usedHours: number;
};

const TeamMemberCard = ({
  name,
  role,
  avatarUrl,
  capacityHours,
  usedHours,
}: Props) => {
  const percentage = Math.round((usedHours / capacityHours) * 100);

  return (
    <div className="flex flex-col gap-3 p-6 rounded-xl shadow-sm bg-white w-[25vw] h-[20vh]">
      <div className="flex gap-6 items-center">
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h2 className="text-black font-semibold text-lg">{name}</h2>
          <p className="text-[#525252] text-sm">{role}</p>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-xs text-[#525252] mb-1">
          <span>Capacity: {capacityHours}h</span>
          <span>{usedHours}h ({percentage}%)</span>
        </div>
        <div className="w-full h-4 bg-[#EBE5EB] rounded-full overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: "#4A2B4A",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard