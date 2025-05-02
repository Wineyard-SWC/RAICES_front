"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SprintMember } from "@/types/sprint";
import DefaultLoading from "@/components/animations/DefaultLoading";

interface ProjectUser {
  id: string;
  name?: string;
  email?: string;
  photoURL?: string;
  role?:  string;
}

interface Props {
  projectId: string;
  already:   SprintMember[];
  onAdd:     (m: SprintMember) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function AddTeamMemberCard({ projectId, already, onAdd }: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string|null>(null);
  const [users, setUsers]     = useState<ProjectUser[]>([]);
  const [selected, setSel]    = useState("");

  /* fetch users cada vez que se abre */
  useEffect(() => {
    if (!open || !projectId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/project_users/project/${projectId}`);
        if (!res.ok) throw new Error("Fetch users failed");
        const list: ProjectUser[] = await res.json();
    
        const filtered = list.filter(
          u => !already.some(m => m.id === u.id)
        );
        setUsers(filtered.length ? filtered : list);   // 👈 fallback
      } catch (e:any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [open, projectId, already]);

  const handleAdd = () => {
    const u = users.find(x => x.id === selected);
    if (!u) return;
    onAdd({
      id:   u.id,
      name: u.name || u.email || "Member",
      role: u.role || "Developer",
      avatar: "https://cdn-icons-png.flaticon.com/512/921/921071.png",
      capacity: 0,
      allocated:0,
    });
    setSel("");
    setOpen(false);
  };

  return (
    <>
      <div className="flex h-full items-center justify-center rounded
                      border border-dashed border-gray-300 p-3">
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center text-gray-500 hover:text-gray-700"
        >
          <Plus className="h-5 w-5" />
          <span className="mt-1 text-sm">Add Member</span>
        </button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <DialogTitle className="text-lg font-bold mb-4">
              Add Team Member
            </DialogTitle>

            {loading ? (
              <DefaultLoading text="Members" />
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : (
              <>
                <select
                  className="w-full p-2 border rounded mb-4"
                  value={selected}
                  onChange={e => setSel(e.target.value)}
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || `User ${u.id}`}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={()=>setOpen(false)}>
                    Cancel
                  </Button>
                  <Button disabled={!selected} onClick={handleAdd}>
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
