import { KanbanItemType } from "@/types/appState/appActions";
import { KanbanStatus } from "@/types/task";
import { useApp } from "@/contexts/appContext/AppContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useKanban = () => {
  const { state, dispatch } = useApp();
  const projectId = state.activeProject!;

  const moveItem = async (type: KanbanItemType, id: string, newStatus: KanbanStatus) => {
    if (!state.activeProject) {
        console.warn('No active project found');
        return;
    }

    // Estado de carga
    dispatch({ type: 'INCREMENT_LOADING' });

    // Mover el elemento Kanban
    try
    {
        if (type === 'tasks') {
            const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${id}/status`, 
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) {
                throw new Error('Error moving task');
            }
        }
        else if (type === 'userStories') {
            const response = await fetch(`${API_URL}/projects/${projectId}/userstories/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Error moving user story');
            }
        }
        else if (type === 'bugs') {
            const response = await fetch(`${API_URL}/projects/${projectId}/bugs/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Error moving bug');
            }
        }

        dispatch({
            type: 'MOVE_KANBAN_ITEM',
            payload: { projectId, type: type, itemId: id, newStatus }
        });

    }catch (error) {
        console.error('Error moving Kanban item:', error);
        dispatch({ type: 'SET_ERROR', payload: { resource: type, message: 'Error moving Kanban item' } });
    } finally {
        dispatch({ type: 'DECREMENT_LOADING' });
    }


    
  };

  return {
    moveTask:       (id: string, status: KanbanStatus) => moveItem('tasks', id, status),
    moveUserStory:  (id: string, status: KanbanStatus) => moveItem('userStories', id, status),
    moveBug:        (id: string, status: KanbanStatus) => moveItem('bugs', id, status),
  };
};
