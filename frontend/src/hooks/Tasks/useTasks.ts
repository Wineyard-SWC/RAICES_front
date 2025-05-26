// hooks/useTasks.ts
import { useApp } from '@/contexts/appContext/AppContext';
import { Task, KanbanStatus } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useTasks = () => {
  const { state, dispatch } = useApp();
   
  // ===== FUNCIONES PARA MANIPULAR TASKS =====
  
  const addTask = async (newTask: Task) => {
    // Verifica si hay un proyecto activo
    if (!state.activeProject) {
      console.warn('No hay proyecto activo');
      return;
    }
    const projectId = state.activeProject;

    // Estado de carga
    dispatch({ 
        type: 'INCREMENT_LOADING'
    });

    // Agregar tarea al proyecto activo
    try 
    {
        const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: 
            {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) 
    {
            throw new Error('Error adding task');
        }
        const nuevaTask = await response.json();

        dispatch({ 
            type: 'ADD_TASK',
            payload: { projectId: state.activeProject, task: nuevaTask } 
        });
    } 
    catch (error) 
    {
        console.error('Error adding task:', error);
        dispatch({ 
            type: 'SET_ERROR',
            payload: { resource: 'tasks', message: 'Error adding task' } 
        });
    }
    finally 
    {
        dispatch({
            type: 'DECREMENT_LOADING',
        });
    }
  };

  const updateTask = async (task: Task) => {
    // Verifica si hay un proyecto activo
    if (!state.activeProject) return;
    const projectId = state.activeProject;
    
    //Estado de carga
    dispatch({ type: 'INCREMENT_LOADING' });

    // Actualizar tarea en el proyecto activo
    try
    {
        const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${task.id}`, {
            method: 'PUT',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Error updating task');
        }

        dispatch({
            type: 'UPDATE_TASK',
            payload: { 
                projectId: state.activeProject, 
                task 
            }
        });
        

    }
    catch (error) 
    {
      console.error('Error updating task:', error);
      dispatch({ type: 'SET_ERROR', payload: { resource: 'tasks', message: 'Error updating task' } });
    }
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!state.activeProject) return;
    const projectId = state.activeProject;
    // Estado de carga
    dispatch({ type: 'INCREMENT_LOADING' });

    // Eliminar tarea del proyecto activo
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error deleting task');
        }
        dispatch({
            type: 'DELETE_TASK',
            payload: { 
                projectId: state.activeProject, 
                taskId 
            }
        });

    } catch (error) 
    {
        console.error('Error deleting task:', error);
        dispatch({ type: 'SET_ERROR', payload: { resource: 'tasks', message: 'Error deleting task' } });
    } 
    finally 
    {
        dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  // ===== FUNCIONES PARA OBTENER DATOS =====
  
  const getActiveProjectTasks = (): Task[] => {
    if (!state.activeProject) return [];
    return Object.values(state.projects[state.activeProject]?.tasks || {});
  };

  const getTasksByProject = (projectId: string): Task[] => {
    return Object.values(state.projects[projectId]?.tasks || {});
  };

  const getTaskById = (taskId: string): Task | undefined => {
    if (!state.activeProject) return undefined;
    return state.projects[state.activeProject]?.tasks[taskId];
  };

  const getTasksByStatus = (status: KanbanStatus): Task[] => {
    return getActiveProjectTasks().filter(task => task.status_khanban === status);
  };

  const getTasksByUserStory = (userStoryId: string): Task[] => {
    return getActiveProjectTasks().filter(task => task.user_story_id === userStoryId);
  };

  // ===== DATOS COMPUTADOS =====
  
  const taskStats = {
    total: getActiveProjectTasks().length,
    completed: getTasksByStatus('Done').length,
    inProgress: getTasksByStatus('In Progress').length,
    todo: getTasksByStatus('To Do').length,
    backlog: getTasksByStatus('Backlog').length,
    inReview: getTasksByStatus('In Review').length
  };

  // ===== RETURN =====
  return {
    // Datos principales
    tasks: getActiveProjectTasks(),
    taskStats,
    
    // Funciones de manipulación
    addTask,
    updateTask,
    deleteTask,
    
    // Funciones de consulta
    getTasksByProject,
    getTaskById,
    getTasksByStatus,
    getTasksByUserStory,
    
    // Estado
    isLoading: state.loadingCount > 0,
    hasActiveProject: !!state.activeProject
  };
};