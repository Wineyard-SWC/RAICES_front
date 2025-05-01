"use client";

interface BacklogCardProps {
  type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  author: string;
  reviewer: string;
  progress: number;
  comments: number;
}

export default function BacklogCard({
  type,
  priority,
  status,
  title,
  description,
  author,
  reviewer,
  progress,
  comments,
}: BacklogCardProps) {
  return (
    <div className="bg-white hover:bg-[#EBE5EB] transition-colors duration-300 ease-in-out  border border-[#D3C7D3] cursor-pointer' shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
        <span className={`flex justify-center items-center text-xs font-bold px-3 py-1 rounded ${type === "BUG" ? "bg-red-600 text-white" : "bg-[#4A2B4A] text-white"}`}>
          {type}
        </span>
        <span className={`flex justify-center items-center text-xs font-bold px-3 py-1 rounded ${priority === "high" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          {priority}
        </span>
        <span className="flex justify-center items-center text-xs font-bold px-3 py-1 rounded bg-gray-600 text-white">
          {status}
        </span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-black mt-2">{title}</h3>
      <p className="text-lg text-black mt-1">{description}</p>
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="text-m text-black">
              <strong>Author:</strong> {author}
            </div>
            <div className="text-m text-black">
              <strong>Reviewer:</strong> {reviewer}
            </div>
          </div>
          <div className="text-m text-black">{comments} Comments</div>
        </div>
        <div className="mt-2">
          <div className="h-2 bg-[#F5F0F1] rounded-full">
            <div className="h-2 bg-[#4A2B4A] rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-m text-black">{progress}%</span>
        </div>
      </div>
    </div>
  );
}