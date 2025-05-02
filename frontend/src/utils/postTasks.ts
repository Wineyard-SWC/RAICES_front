import type { Task, TaskFormData } from "@/types/task"

const apiURL = process.env.NEXT_PUBLIC_API_URL!

// 1) Obtener todas las tasks de un proyecto
export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  const res = await fetch(`${apiURL}/${projectId}/tasks`)
  if (!res.ok) throw new Error("Failed to fetch tasks")
  return res.json()
}

// postTasks.ts
export const postTasks = async (
  projectId: string,
  tasks: Task[]
): Promise<Task[]> => {
  // Mapea cada Task, renombra status → status_khanban
  // y si no existía le pones "Backlog" para cumplir el modelo
  const payload = tasks.map(({ status, ...rest }) => ({
    ...rest,
    status_khanban: status ?? "Backlog",  // ← default aquí
  }));

  const res = await fetch(
    `${apiURL}/projects/${projectId}/tasks/batch`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to save tasks batch");
  }
  return res.json();
};

// 3) Crear una task
export const createTask = async (
  projectId: string,
  taskData: TaskFormData
): Promise<Task> => {
  const res = await fetch(`${apiURL}/${projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  })
  if (!res.ok) {
    console.error(await res.text())
    throw new Error("Failed to create task")
  }
  return res.json()
}

// 4) Actualizar una task
export const updateTask = async (
  projectId: string,
  taskId: string,
  taskData: Partial<TaskFormData>
): Promise<Task> => {
  const res = await fetch(`${apiURL}/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  })
  if (!res.ok) {
    console.error(await res.text())
    throw new Error("Failed to update task")
  }
  return res.json()
}

// 5) Eliminar una task
export const deleteTask = async (
  projectId: string,
  taskId: string
): Promise<void> => {
  const res = await fetch(`${apiURL}/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    console.error(await res.text())
    throw new Error("Failed to delete task")
  }
}
