// hooks/useProjectUsers.ts
"use client";
import { useEffect, useState } from "react";
import type { SprintMember } from "@/types/sprint";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useProjectUsers(projectId: string, alreadyAdded: SprintMember[]) {
  const [users, setUsers]   = useState<SprintMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  useEffect(() => {
    if (!projectId) return;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/project_users/project/${projectId}`);
        if (!res.ok) throw new Error("Can't load team");
        const data = await res.json();     // [{ id,name,email,role, … }]
        setUsers(
          data
            // evita mostrar los ya añadidos
            .filter((u:any) => !alreadyAdded.some(m => m.id === u.id))
            .map((u:any) => ({
              id:        u.id,
              name:      u.name || u.email,
              role:      u.role || "Member",
              avatar:    u.avatar,
              capacity:  40,
              allocated: 0,
            }))
        );
      } catch (e:any) { setError(e.message); }
      finally        { setLoading(false);  }
    };
    fetchUsers();
  }, [projectId, alreadyAdded]);

  return { users, loading, error };
}
