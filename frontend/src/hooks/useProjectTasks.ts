'use client';

import { useEffect, useState } from "react";
import { TaskColumns } from "@/types/taskkanban";
import { Task } from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useProjectTasks = (projectId: string | null) => {
  const [tasks, setTasks] = useState<TaskColumns>({
    backlog: [],
    todo: [],
    inprogress: [],
    inreview: [],
    done: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const response = await fetch(API_URL + `/projects/${projectId}/tasks/khanban`);
      const rawTasks: Task[] = await response.json();
      
      const grouped: TaskColumns = {
        backlog: [],
        todo: [],
        inprogress: [],
        inreview: [],
        done: [],
      };
      const statusMap: Record<string, keyof TaskColumns> = {
        'backlog': 'backlog',
        'to do': 'todo',
        'in progress': 'inprogress',
        'in review': 'inreview',
        'done': 'done'
      };

      rawTasks.forEach((task) => {
        const statusKey = statusMap[task.status_khanban?.toLowerCase().trim() ?? ''] || 'backlog';
        grouped[statusKey].push(task);
      });

      console.log(grouped)

      setTasks(grouped);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return {
    tasks,
    loading,
    setTasks,
    refreshTasks: fetchTasks,
  };
};
