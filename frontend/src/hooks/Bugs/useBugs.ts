// hooks/useBugs.ts
import { useApp } from '@/contexts/appContext/AppContext';
import { Bug } from '@/types/bug';
import { KanbanStatus } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useBugs = () => {
  const { state, dispatch } = useApp();
  const projectId = state.activeProject;

  const addBug = async (newBug: Bug) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    
    try 
    {
      const res = await fetch(`${API_URL}/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBug),
      });
      
      if (!res.ok) throw new Error('Error adding bug');
      const bug = await res.json();
      dispatch({ type: 'ADD_BUG', payload: { projectId, bug } });

    } 
    catch (error) 
    {
      dispatch({ type: 'SET_ERROR', payload: { resource: 'bugs', message: 'Error adding bug' } });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateBug = async (bug: Bug) => {
    if (!projectId) return;
    
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try 
    {
        const res = await fetch(`${API_URL}/bugs/${bug.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bug),
        });
        
        if (!res.ok) throw new Error('Error updating bug');
        
        dispatch({ type: 'UPDATE_BUG', payload: { projectId, bug } });
    } 
    catch (error) 
    {
        dispatch({ type: 'SET_ERROR', payload: { resource: 'bugs', message: 'Error updating bug' } });
    } 
    finally 
    {
       dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const deleteBug = async (bugId: string) => {
    if (!projectId) return;
    
    dispatch({ type: 'INCREMENT_LOADING' });
    
    try 
    {
        const res = await fetch(`${API_URL}/bugs/${bugId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error deleting bug');
        dispatch({ type: 'DELETE_BUG', payload: { projectId, bugId } });
    } 
    catch (error) 
    {
       dispatch({ type: 'SET_ERROR', payload: { resource: 'bugs', message: 'Error deleting bug' } });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const getBugs = (): Bug[] => {
    if (!projectId) return [];
    return Object.values(state.projects[projectId]?.bugs || {});
  };

  const getBugsByStatus = (status: KanbanStatus): Bug[] => {
    return getBugs().filter(bug => bug.status_khanban === status);
  };

  return {
    bugs: getBugs(),
    addBug,
    updateBug,
    deleteBug,
    getBugsByStatus,
    isLoading: state.loadingCount > 0,
    hasActiveProject: !!state.activeProject,
  };
};
