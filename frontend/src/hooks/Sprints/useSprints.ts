// hooks/useSprints.ts
import { useApp } from '@/contexts/appContext/AppContext';
import { Sprint } from '@/types/sprint';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useSprints = () => {
  const { state, dispatch } = useApp();
  const projectId = state.activeProject;

  const addSprint = async (newSprint: Sprint) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
        const res = await fetch(`${API_URL}/projects/${projectId}/sprints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSprint),
        });
       
        if (!res.ok) throw new Error('Error adding sprint');
        
        const sprint = await res.json();
        
        dispatch({ type: 'ADD_SPRINT', payload: { projectId, sprint } });
    } 
    catch (error) 
    {
        dispatch({ type: 'SET_ERROR', payload: { resource: 'sprints', message: 'Error adding sprint' } });
    } 
    finally 
    {
        dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateSprint = async (sprint: Sprint) => {
    if (!projectId) return;
    
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/sprints/${sprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sprint),
      });
      
      if (!res.ok) throw new Error('Error updating sprint');
      
      dispatch({ type: 'UPDATE_SPRINT', payload: { projectId, sprint } });
    } 
    catch (error) 
    {
      dispatch({ type: 'SET_ERROR', payload: { resource: 'sprints', message: 'Error updating sprint' } });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const deleteSprint = async (sprintId: string) => {
    if (!projectId) return;
    
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/sprints/${sprintId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Error deleting sprint');
      
      dispatch({ type: 'DELETE_SPRINT', payload: { projectId, sprintId } });
    } 
    catch (error) 
    {
      dispatch({ type: 'SET_ERROR', payload: { resource: 'sprints', message: 'Error deleting sprint' } });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const getSprints = (): Sprint[] => {
    if (!projectId) return [];
    return Object.values(state.projects[projectId]?.sprints || {});
  };

  const getSprintById = (sprintId: string): Sprint | undefined => {
    return state.projects[projectId!]?.sprints[sprintId];
  };

  return {
    sprints: getSprints(),
    getSprintById,
    addSprint,
    updateSprint,
    deleteSprint,
    isLoading: state.loadingCount > 0,
    hasActiveProject: !!state.activeProject,
  };
};
