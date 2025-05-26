// hooks/useRequirements.ts
import { useApp } from '@/contexts/appContext/AppContext';
import { Requirement } from '@/types/requirement';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useRequirements = () => {
  const { state, dispatch } = useApp();
  const projectId = state.activeProject;

  const addRequirement = async (newReq: Requirement) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try {
        const res = await fetch(`${API_URL}/projects/${projectId}/requirements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReq),
        });

        if (!res.ok) throw new Error('Error adding requirement');

        const requirement = await res.json();
        dispatch({
            type: 'ADD_REQUIREMENT',
            payload: { projectId, requirement },
        });
    } 
    catch (error) 
    {
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'requirements', message: 'Error adding requirement' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateRequirement = async (requirement: Requirement) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try {
        const res = await fetch(`${API_URL}/projects/${projectId}/requirements/${requirement.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requirement),
        });

        if (!res.ok) throw new Error('Error updating requirement');

        dispatch({
            type: 'UPDATE_REQUIREMENT',
            payload: { projectId, requirement },
        });
    } 
    catch (error) 
    {
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'requirements', message: 'Error updating requirement' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const deleteRequirement = async (requirementId: string) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try {
        const res = await fetch(`${API_URL}/projects/${projectId}/requirements/${requirementId}`, {
            method: 'DELETE',
        });

        if (!res.ok) throw new Error('Error deleting requirement');

        dispatch({
            type: 'DELETE_REQUIREMENT',
            payload: { projectId, requirementId },
        });
    } 
    catch (error) 
    {
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'requirements', message: 'Error deleting requirement' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const getRequirements = (): Requirement[] => {
    if (!projectId) return [];
    return Object.values(state.projects[projectId]?.requirements || {});
  };

  const getRequirementById = (id: string): Requirement | undefined => {
    return state.projects[projectId!]?.requirements[id];
  };

  return {
    requirements: getRequirements(),
    getRequirementById,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    isLoading: state.loadingCount > 0,
    hasActiveProject: !!state.activeProject,
  };
};
