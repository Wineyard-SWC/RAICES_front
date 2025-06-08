"use client";
import { Html } from "@react-three/drei";

interface MemberInfoPanelProps {
  member: any;
  memberMood: any;
  position: [number, number, number];
}

export default function MemberInfoPanel({ member, memberMood, position }: MemberInfoPanelProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No sessions';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Html position={position} center distanceFactor={16} className="pointer-events-none">
      <div className="bg-white p-0.5 rounded shadow border border-[#4a2b4a]/20 w-24 transform scale-75 origin-top-left">
        {/* Header */}
        <div className="flex items-center gap-0.5 mb-0.5">
          <div className="w-5 h-5 rounded-full bg-[#4a2b4a]/10 flex items-center justify-center">
            <span className="text-[8px]">{memberMood?.moodInterpretation.emoji || '😊'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#4a2b4a] text-[8px] truncate" title={member.name}>
              {member.name}
            </h3>
            <p className="text-[7px] text-gray-500 truncate">Team Member</p>
          </div>
        </div>

        {/* Mood */}
        <div className="mb-0.5">
          <div className="flex justify-between items-center mb-0.5 text-[7px]">
            <span className="font-medium text-gray-600">Mood</span>
            <span className={`font-bold ${memberMood?.moodInterpretation.color || 'text-gray-500'}`}>
              {memberMood?.mood || 50}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-px">
            <div
              className="bg-[#4a2b4a] h-px rounded-full transition-all duration-300"
              style={{ width: `${memberMood?.mood || 50}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-0.5 mb-0.5 text-[7px]">
          <div className="text-center p-0.5 bg-[#ebe5eb]/30 rounded">
            <div className="font-bold text-[#4a2b4a] text-[8px]">{member.tasksCompleted || 0}</div>
            <div className="truncate">Tasks</div>
          </div>
          <div className="text-center p-0.5 bg-[#ebe5eb]/30 rounded">
            <div className="font-bold text-[#4a2b4a] text-[8px]">{member.currentTasks || 0}</div>
            <div className="truncate">Active</div>
          </div>
        </div>

        {/* Biometric Data */}
        {memberMood && (
          <div className="border-t pt-0.5">
            <div className="text-[7px] text-gray-600 mb-0.5 truncate">
              <strong>Bio:</strong>
            </div>
            <div className="flex justify-between text-[7px]">
              <span className="truncate flex-1">
                <span className="text-gray-500">Sess:</span>
                <span className="ml-0.5 font-medium">{memberMood.sessionCount}</span>
              </span>
              <span className="truncate flex-1 text-right">
                <span className="text-gray-500">Str:</span>
                <span className="ml-0.5 font-medium">
                  {(memberMood.stress * 100).toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="text-[6px] text-gray-500 mt-0.5 truncate" title={formatDate(memberMood.lastSessionDate)}>
              Last: {formatDate(memberMood.lastSessionDate)}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}
