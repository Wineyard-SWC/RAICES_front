// hooks/useUserStories.ts
import { useApp } from '@/contexts/appContext/AppContext';
import { UserStory } from '@/types/userstory';
import { KanbanStatus } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useUserStories = () => {
  const { state, dispatch } = useApp();

  const projectId = state.activeProject;

  const addUserStory = async (newStory: UserStory) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/userstories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory),
      });

      if (!res.ok) throw new Error('Error adding user story');

      const story = await res.json();
      dispatch({
        type: 'ADD_USER_STORY',
        payload: { projectId, userStory: story },
      });
    } 
    catch (error) 
    {
      console.error(error);
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'userStories', message: 'Error adding user story' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const updateUserStory = async (story: UserStory) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/userstories/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story),
      });

      if (!res.ok) throw new Error('Error updating user story');

      dispatch({
        type: 'UPDATE_USER_STORY',
        payload: { projectId, userStory: story },
      });
    } 
    catch (error) 
    {
      console.error(error);
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'userStories', message: 'Error updating user story' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const deleteUserStory = async (storyId: string) => {
    if (!projectId) return;

    dispatch({ type: 'INCREMENT_LOADING' });
    try 
    {
      const res = await fetch(`${API_URL}/projects/${projectId}/userstories/${storyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error deleting user story');

      dispatch({
        type: 'DELETE_USER_STORY',
        payload: { projectId, userStoryId: storyId },
      });
    } 
    catch (error) 
    {
      console.error(error);
      dispatch({
        type: 'SET_ERROR',
        payload: { resource: 'userStories', message: 'Error deleting user story' },
      });
    } 
    finally 
    {
      dispatch({ type: 'DECREMENT_LOADING' });
    }
  };

  const getActiveProjectUserStories = (): UserStory[] => {
    if (!projectId) return [];
    return Object.values(state.projects[projectId]?.userStories || {});
  };

  const getUserStoriesByProject = (id: string): UserStory[] => {
    return Object.values(state.projects[id]?.userStories || {});
  };

  const getUserStoryById = (storyId: string): UserStory | undefined => {
    if (!projectId) return undefined;
    return state.projects[projectId]?.userStories[storyId];
  };

  const getUserStoriesByStatus = (status: KanbanStatus): UserStory[] => {
    return getActiveProjectUserStories().filter(us => us.status_khanban === status);
  };

  const userStoryStats = {
    total: getActiveProjectUserStories().length,
    completed: getUserStoriesByStatus('Done').length,
    inProgress: getUserStoriesByStatus('In Progress').length,
    todo: getUserStoriesByStatus('To Do').length,
    backlog: getUserStoriesByStatus('Backlog').length,
    inReview: getUserStoriesByStatus('In Review').length,
  };

  return {
    userStories: getActiveProjectUserStories(),
    userStoryStats,
    addUserStory,
    updateUserStory,
    deleteUserStory,
    getUserStoryById,
    getUserStoriesByProject,
    getUserStoriesByStatus,
    isLoading: state.loadingCount > 0,
    hasActiveProject: !!state.activeProject,
  };
};
