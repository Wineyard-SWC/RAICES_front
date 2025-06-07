"use client";

import { Comments } from "@/types/userstory";
import {
  MoreVertical,
  Pencil,
  MessageSquare,
  Bug,
  CheckSquare,
  BookOpen,
  User,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { useState, useRef, useEffect } from "react";
import AddCommentModal from "./productbacklog.addcommentmodal";
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/confimDialog";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { isUserStory,isBug } from "@/types/taskkanban";
import { printError } from "@/utils/debugLogger";


interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
}

interface UserWorkload {
  id: string;
  name: string;
  progress: number;
  tasks: string;
  completedTasks: number;
  totalTasks: number;
}


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
  comments: Comments[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: "accept" | "reject" | null;
  }>({ open: false, action: null });
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [authorName, setAuthorName] = useState(author);
  const [reviewerName, setReviewerName] = useState(reviewer);
  const menuRef = useRef<HTMLDivElement>(null)

  const priorityColors = {
    Low: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    High: "bg-red-100 text-red-800 border-red-200",
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  }

  const statusColors = {
    Backlog: "bg-gray-100 text-gray-800 border-gray-200",
    "To Do": "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "In Review": "bg-purple-100 text-purple-800 border-purple-200",
    Done: "bg-green-100 text-green-800 border-green-200",
  }

  const typeConfig = {
    BUG: {
      color: "border-l-red-500",
      bgColor: "bg-red-50",
      icon: <Bug className="h-5 w-5 text-red-600" />,
      label: "Bug",
    },
    TASK: {
      color: "border-l-purple-500",
      bgColor: "bg-purple-50",
      icon: <CheckSquare className="h-5 w-5 text-purple-600" />,
      label: "Task",
    },
    "USER STORY": {
      color: "border-l-blue-500",
      bgColor: "bg-blue-50",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      label: "User Story",
    },
  }

  const itemType = type.toUpperCase() as keyof typeof typeConfig
  const typeSettings = typeConfig[itemType] || typeConfig["USER STORY"]

  const { 
      tasks,
      updateTaskStatus,
      updateBugStatus,
      updateStoryStatus
    } = useKanban()


   // Find current task in any column
  const findCurrentTask = () => {
    const columns = ["backlog", "todo", "inprogress", "inreview", "done"] as const
    for (const column of columns) {
      const found = tasks[column].find(task => task.id === id)
      if (found) return found
    }
    return null
  }

  const currentTask = findCurrentTask()

  const handleConfirm = async () => {
    if (!currentTask) return;
    
    const newStatus = confirmState.action === "accept" ? "Done" : "In Progress";
    
    try {
      if (isUserStory(currentTask)) {
        await updateStoryStatus(id, newStatus);
      } else if (isBug(currentTask)) {
        await updateBugStatus(id, newStatus);
      } else {
        await updateTaskStatus(id, newStatus);
      }
      setConfirmState({ open: false, action: null });
    } catch (error) {
      printError("Error updating status:", error);
    }
  };

  const fetchUserData = async (userId: string): Promise<User | null> => {
    if (userMap[userId]) {
      return userMap[userId];
    }

    const cachedUsers = localStorage.getItem('cached_users');
    const cachedUserMap: Record<string, User> = cachedUsers ? JSON.parse(cachedUsers) : {};
    
    if (cachedUserMap[userId]) {
      setUserMap(prev => ({ ...prev, [userId]: cachedUserMap[userId] }));
      return cachedUserMap[userId];
    }

    try {
      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const userData = await response.json();
      
      cachedUserMap[userId] = userData;
      localStorage.setItem('cached_users', JSON.stringify(cachedUserMap));
      
      setUserMap(prev => ({ ...prev, [userId]: userData }));
      
      return userData;
    } catch (error) {
      printError(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNames = async () => {
      const authorUser = await fetchUserData(author);
      if (authorUser?.name) setAuthorName(authorUser.name);
  
      const reviewerUser = await fetchUserData(reviewer);
      if (reviewerUser?.name) setReviewerName(reviewerUser.name);
    };
  
    fetchNames();
  }, [author, reviewer]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
     <div
      className={`relative bg-white hover:bg-[#EBE5EB] transition-colors duration-300 ease-in-out 
                border ${typeSettings.color} border-l-4 border-t border-r border-b border-[#D3C7D3] 
                cursor-pointer shadow-md rounded-lg p-5 mb-5`}
    >
      {/* Menu Button */}
      <div className="absolute right-3 top-3" ref={menuRef}>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)}>
          <MoreVertical className="h-5 w-5" />
        </Button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
            <button
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#4A2B4A] hover:bg-gray-100"
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

      {/* Type and Priority Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${typeSettings.bgColor}`}
        >
          {typeSettings.icon}
          <span>{typeSettings.label}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
            priorityColors[priority as keyof typeof priorityColors]
          }`}
        >
          <span>{priority}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
            statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          <span>{status}</span>
        </div>
      </div>

      {/* Title and Description */}
      <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2">{title}</h3>
      <p className="text-base text-gray-700 mb-4">{description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="h-2.5 bg-[#F5F0F1] rounded-full overflow-hidden">
          <div
            className={`h-2.5 rounded-full ${
              progress < 30 ? "bg-red-500" : progress < 70 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* People and Comments Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-4 w-4" />
            <span className="font-medium">Author:</span>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-[#4A2B4A] text-white flex items-center justify-center text-xs font-medium mr-1.5">
                {getInitials(authorName)}
              </div>
              <span>{authorName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <UserCheck className="h-4 w-4" />
            <span className="font-medium">Reviewer:</span>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-[#4A2B4A] text-white flex items-center justify-center text-xs font-medium mr-1.5">
                {getInitials(reviewerName)}
              </div>
              <span>{reviewerName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowCommentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F0F1] hover:bg-[#E5E0E5] rounded-full text-gray-700 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{comments.length} Comments</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <Button
          onClick={() => setConfirmState({ open: true, action: "reject" })}
          className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 rounded-md flex items-center gap-1.5"
          disabled={loading}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>Reject</span>
        </Button>
        <Button
          onClick={() => setConfirmState({ open: true, action: "accept" })}
          className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-md flex items-center gap-1.5"
          disabled={loading}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>Accept</span>
        </Button>
      </div>

      {/* Modals */}
      {showCommentModal && (
        <AddCommentModal
          onClose={() => setShowCommentModal(false)}
          taskTitle={title}
          taskId={id}
          comments={comments}
          onCommentsChange={setComments}
        />
      )}

      {confirmState.open && (
        <ConfirmDialog
          open={confirmState.open}
          title={confirmState.action === "accept" ? "Accept Item" : "Reject Item"}
          message={
            confirmState.action === "accept"
              ? "Are you sure you want to mark this item as Done?"
              : "Are you sure you want to send this item back to In Progress?"
          }
          onCancel={() => setConfirmState({ open: false, action: null })}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}