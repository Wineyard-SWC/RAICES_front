'use client';

import { useEffect, useState } from "react";
import { Project } from "@/types/project";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useProjects = (userId: string | undefined) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fetchProjects = async () => {
      setLoading(true);
      try {
            const response = await fetch(`${API_URL}/project_users/user/${userId}`);
            const data: Project[] = await response.json();
            setProjects(data); 
      }
      catch (err) 
      {
        console.error("Failed to fetch projects", err);
      } 
      finally 
      {
        setLoading(false);
      }
    };
    
  useEffect(() => {
    if (!userId) return;
    if (loading) return;

    

    fetchProjects();
  }, [userId]);

  return { projects, loading };
};