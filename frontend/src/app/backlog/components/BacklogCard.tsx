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
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <span className={`text-xs font-bold px-2 py-1 rounded ${type === "BUG" ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"}`}>
            {type}
          </span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${priority === "high" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {priority}
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">{status}</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mt-2">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="text-sm text-gray-600">
              <strong>Author:</strong> {author}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Reviewer:</strong> {reviewer}
            </div>
          </div>
          <div className="text-sm text-gray-600">{comments} Comments</div>
        </div>
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-purple-600 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-xs text-gray-600">{progress}%</span>
        </div>
      </div>
    </div>
  );
}