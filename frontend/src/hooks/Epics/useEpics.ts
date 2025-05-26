// hooks/useEpics.ts
import { useApp } from '@/contexts/appContext/AppContext';
import { Epic } from '@/types/epic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useEpics = () => {
  const { state, dispatch } = useApp();
  const projectId = state.activeProject;

  const addEpic = async (newEpic: Epic) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/epics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEpic),
      });

      if (!res.ok) throw new Error('Error adding epic');

      const epic = await res.json();
      dispatch({
        type: 'ADD_EPIC',
        payload: { projectId, epic },
      });
    } 
    catch (error) 
    {
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'epics', message: 'Error adding epic' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateEpic = async (epic: Epic) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/epics/${epic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(epic),
      });

      if (!res.ok) throw new Error('Error updating epic');

      dispatch({
        type: 'UPDATE_EPIC',
        payload: { projectId, epic },
      });
    } 
    catch (error) 
    {
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'epics', message: 'Error updating epic' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const deleteEpic = async (epicId: string) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/epics/${epicId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error deleting epic');

      dispatch({
        type: 'DELETE_EPIC',
        payload: { projectId, epicId },
      });
    } 
    catch (error) 
    {
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'epics', message: 'Error deleting epic' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const getEpics = (): Epic[] => {
    if (!projectId) return [];
    return Object.values(state.projects[projectId]?.epics || {});
  };

  const getEpicById = (id: string): Epic | undefined => {
    return state.projects[projectId!]?.epics[id];
  };

  return {
    epics: getEpics(),
    getEpicById,
    addEpic,
    updateEpic,
    deleteEpic,
    isLoading: state.loadingCount > 0,
    hasActiveProject: !!state.activeProject,
  };
};
