"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SprintMember } from "@/types/sprint";
import DefaultLoading from "@/components/animations/DefaultLoading";
import { print } from "@/utils/debugLogger";

interface ProjectUser {
  id: string;
  name?: string;
  email?: string;
  photoURL?: string;
  role?: string;
  user_id?: string;
  userId?: string;
  username?: string;
  avatar?: string;
  profile_picture?: string;
  userRef?: string | null;
}

interface Props {
  projectId: string;
  already: SprintMember[];
  onAdd: (m: SprintMember) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function AddTeamMemberCard({ projectId, already, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [selected, setSel] = useState("");

  useEffect(() => {
    if (!open) return;
    
    print("Loading users for project:", projectId); 
    print("Already added members:", already); 
    
    setLoading(true);
    setError(null);
    fetch(`${API}/project_users/project/${projectId}`)
      .then(res => {
        print("API response status:", res.status); 
        if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);
        return res.json();
      })
      .then((list: ProjectUser[]) => {
        // print("Raw users from API:", list); 
        
        const normalized = list.map(u => ({
          ...u,
          id: String(u.userRef || u.user_id || u.userId || ''),
          name: u.name || u.username || u.email || 'Unknown User',
          avatar: u.photoURL || u.avatar || u.profile_picture
        }));
        
        // print("Normalized users:", normalized); 

        const alreadyIds = already.map(m => m.id);
        // print("🔍 Already IDs:", alreadyIds); 
        // print("🔍 Normalized IDs:", normalized.map(u => u.id));

        const filtered = normalized.filter(u => {
          const isIncluded = alreadyIds.includes(u.id);
          // print(`🔍 User ${u.id} (${u.name}) - Already included: ${isIncluded}`);
          return u.id && !isIncluded;
        });

        // print("🔍 Final filtered count:", filtered.length); 
        // print("Filtered users (not in sprint):", filtered);
        
        setUsers(filtered); 
      })
      .catch(e => {
        console.error("Error loading users:", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [open, projectId, already]);

  const handleAdd = () => {
    const u = users.find(x => x.id === selected);
    if (!u) {
      console.error("User not found:", selected);
      return;
    }
    
    const newMember: SprintMember = {
      id: u.id,
      name: u.name || u.email || "Member",
      role: u.role || "Developer", 
      avatar: u.avatar || "https://cdn-icons-png.flaticon.com/512/921/921071.png",
      capacity: 40,
      allocated: 0
    };

    print("Adding new member:", newMember); 

    const updatedMembers = [...already, newMember];
    print("Team members after add:", updatedMembers);

    onAdd(newMember);
    setSel("");
    setOpen(false);
  };

  return (
    <>
      {/* Card de agregar miembro */}
      <div className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-3 mb-6 min-h-[120px]">
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center text-gray-500 hover:text-gray-700"
        >
          <Plus className="h-5 w-5" />
          <span className="mt-1 text-sm">Add Member</span>
        </button>
      </div>

      {/* Modal de agregar miembro */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
            <DialogTitle className="text-lg font-bold mb-4">
              Add Team Member
            </DialogTitle>

            {loading ? (
              <DefaultLoading text="Members" />
            ) : error ? (
              <div className="mb-4">
                <p className="text-red-600 mb-2">Error: {error}</p>
                <p className="text-sm text-gray-500">
                  Check console for details
                </p>
              </div>
            ) : (
              <>
                {users.length === 0 ? (
                  <div className="mb-4">
                    <p className="text-gray-500">No users available to add.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Project ID: {projectId}
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      aria-label="Members"
                      className="w-full p-2 border rounded mb-4"
                      value={selected}
                      onChange={e => setSel(e.target.value)}
                    >
                      <option value="">Select a user ({users.length} available)</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email || u.id} {u.role ? `(${u.role})` : ''}
                        </option>
                      ))}
                    </select>

                    {/* FIX: Debug info */}
                    <div className="text-xs text-gray-400 mb-2">
                      Debug: {users.length} users loaded, {already.length} already in sprint
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button disabled={!selected || users.length === 0} onClick={handleAdd}>
                    Add
                  </Button>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}