import { useState } from "react";
import { MessageSquare, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskOrStory } from "@/types/taskkanban";
import { Comments } from "@/types/userstory";

interface CommentsSectionProps {
  task: TaskOrStory;
  userId: string | null;
  userData: any;
  onUpdateComments: (comments: Comments[]) => void;
}

const CommentsSection = ({ task, userId, userData, onUpdateComments }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async () => {
    if (!task || !newComment.trim()) return;
    
    const comment = {
      id: crypto.randomUUID(),
      user_id: userId || "",
      user_name: userData?.name || "Unknown User",
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const updatedComments = Array.isArray(task.comments)
        ? [...task.comments, comment]
        : [comment];
      
      await onUpdateComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!task || !('comments' in task)) return;

    try {
      const updatedComments = Array.isArray(task.comments)
        ? task.comments.filter((c: Comments) => c.id !== commentId)
        : [];
      
      await onUpdateComments(updatedComments);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!('comments' in task)) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <div className="flex items-center mb-3">
        <MessageSquare className="h-4 w-4 text-[#4A2B4A] mr-2" />
        <p className="font-semibold text-[#4A2B4A] text-lg">Comments:</p>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
        {Array.isArray(task.comments) && task.comments.length > 0 ? (
          task.comments.map((comment: Comments) => (
            <div key={comment.id} className="bg-[#F5F0F1] border border-gray-200 p-2 rounded-md relative">
              <div className="flex justify-between text-lg text-gray-600">
                <span>
                  <strong>{comment.user_name}</strong> · {new Date(comment.timestamp).toLocaleString()}
                </span>
                {comment.user_id === userId && (
                  <button
                    aria-label="Delete Comment"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-black mt-1 text-lg">{comment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic text-lg">No comments yet</p>
        )}
      </div>
      
      {/* Add comment form */}
      <div className="mt-3">
        <textarea
          rows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-lg resize-none"
          placeholder="Write your comment here..."
        />
        <div className="flex justify-end mt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || !userId}
            className="bg-[#4A2B4A] hover:bg-[#3a2248] text-lg py-1 px-2"
          >
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;