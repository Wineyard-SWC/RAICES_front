import type { Task, TaskFormData } from "@/types/task"
import { TaskContextType } from "@/contexts/taskcontext"

const apiURL = process.env.NEXT_PUBLIC_API_URL!

export const getTasksContext = () => {
 
  return null;
}

// 1) Obtener todas las tasks de un proyecto
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  try {
        const response = await fetch(`${apiURL}/projects/${projectId}/tasks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      }
      
    catch (error) {
    console.error('Error loading tasks:', error);
    return []; 
}
}

// postTasks.ts
export const postTasks = async (
  projectId: string,
  tasks: Task[],
  tasksContext?: TaskContextType
): Promise<Task[]> => {

  const payload = tasks.map(({date,selected, status_khanban, ...rest }) => ({
    ...rest,
    status_khanban: status_khanban ?? "To Do",
    date: ""
  }));

  const res = await fetch(
    `${apiURL}/projects/${projectId}/tasks/batch`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (tasksContext) {
    tasksContext.setTasksForProject(projectId, payload);
  }

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to save tasks batch");
  }

  return res.json();
};


// 3) Crear una task
export const createTask = async (
  projectId: string,
  taskData: TaskFormData,
  tasksContext?: TaskContextType
): Promise<Task> => {
  // Make API request
  const res = await fetch(`${apiURL}/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to create task");
  }

  const createdTask = await res.json();

  
  if (tasksContext) {
      const currentTasks = tasksContext.getTasksForProject(projectId)
      
      tasksContext.setTasksForProject(
        projectId, 
        [...currentTasks, createdTask]
      )
  }
  

  return createdTask;
};

// 4) Actualizar una task
export const updateTask = async (
  projectId: string,
  taskId: string,
  taskData: Partial<TaskFormData>,
  tasksContext?: TaskContextType
): Promise<Task> => {
  const res = await fetch(`${apiURL}/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to update task");
  }

  const updatedTask = await res.json();

  if (tasksContext) {
    tasksContext.updateTaskInProject(projectId, taskId, updatedTask);
  }

  return updatedTask;
};

// 5) Eliminar una task
export const deleteTask = async (
  projectId: string,
  taskId: string,
  tasksContext?: TaskContextType
): Promise<void> => {
  // Make API request
  const res = await fetch(`${apiURL}/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to delete task");
  }

  if (tasksContext) {
    tasksContext.removeTaskFromProject(projectId, taskId);
  }
};
