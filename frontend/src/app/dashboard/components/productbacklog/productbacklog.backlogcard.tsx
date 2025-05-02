"use client";

import { comments } from "@/types/userstory";
import { MoreVertical, Pencil } from "lucide-react"
import { useState, useRef, useEffect } from "react";
import AddCommentModal from "./productbacklog.addcommentmodal";
import { Button } from "@/components/ui/button"

interface BacklogCardProps {
  id:string;
  type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  author: string;
  reviewer: string;
  progress: number;
  comments: comments[];
}

export default function BacklogCard({
  id,
  type,
  priority,
  status,
  title,
  description,
  author,
  reviewer,
  progress,
  comments: initialComments,
}: BacklogCardProps) {

  const [showCommentModal, setShowCommentModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [comments, setComments] = useState(initialComments)


  

  return (
    <div className="relative  bg-white hover:bg-[#EBE5EB] transition-colors duration-300 ease-in-out  border border-[#D3C7D3] cursor-pointer' shadow-md rounded-lg p-4 mb-4">
      <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-20">
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#4A2B4A] hover:bg-gray-100"
              onClick={() => {
                setShowCommentModal(true)
                setMenuOpen(false)
              }}
            >
              <Pencil className="h-4 w-4" /> Add Comment
              
            </button>
          </div>
        )}
        </div>
        <div className="flex justify-between items-center">
        <div className="flex gap-2">
        <span className={`flex justify-center items-center text-xs font-bold px-3 py-1 rounded ${type === "BUG" ? "bg-red-600 text-white" : type === "TASK" ? "bg-[#0029f9] text-white": "bg-[#4A2B4A] text-white"}`}>
          {type}
        </span>
        <span className={`flex justify-center items-center text-xs font-bold px-3 py-1 rounded ${priority === "high" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          {priority}
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
          <div className="text-m text-black">{comments.length} Comments</div>
        </div>
        <div className="mt-2">
          <div className="h-2 bg-[#F5F0F1] rounded-full">
            <div className="h-2 bg-[#4A2B4A] rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-m text-black">{progress}%</span>
        </div>
      </div>

      {showCommentModal && (
        <AddCommentModal
          onClose={() => setShowCommentModal(false)}
          taskTitle={title}
          taskId={id}
          comments={comments}
          onCommentsChange={setComments}
        />
      )}
    </div>
  );
}