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
  role?: string;
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

  // Carga usuarios cuando se abre el modal
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`${API}/project_users/project/${projectId}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch users failed");
        return res.json();
      })
      .then((list: ProjectUser[]) => {
        // convierte cualquier id numérico a string
        const normalized = list.map(u => ({ ...u, id: String(u.id) }));
        // filtra los que ya están en `already`
        const filtered = normalized.filter(u => !already.some(m => m.id === u.id));
        setUsers(filtered.length ? filtered : normalized);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, projectId, already]);

  const handleAdd = () => {
    const u = users.find(x => x.id === selected);
    if (!u) return;
    const newMember: SprintMember = {
      id: u.id,
      name: u.name || u.email || "Member",
      role: u.role || "Developer",
      avatar: u.photoURL || "https://cdn-icons-png.flaticon.com/512/921/921071.png",
      capacity: 0,
      allocated: 0,
    };

    // Imprimir lista actualizada de miembros
    const updatedMembers = [...already, newMember];
    console.log("Team members after add:", updatedMembers);

    onAdd(newMember);
    setSel("");
    setOpen(false);
  };

  return (
    <>
      {/* Card de agregar miembro */}
      <div className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-3 mb-6">
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
              <p className="text-red-600">{error}</p>
            ) : (
              <>
                <select
                  aria-label="Members"
                  className="w-full p-2 border rounded mb-4"
                  value={selected}
                  onChange={e => setSel(e.target.value)}
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || u.id}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
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
