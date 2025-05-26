import { AppState } from "@/types/appState/appState";
import { AppAction } from "@/types/appState/appActions";
import { initialState } from "@/types/appState/appState";
// reducers/appReducer.ts
export const appReducer = (state: AppState, action: AppAction, ): AppState => {
    switch (action.type) {
        // === USUARIO ===
        case 'SET_USUARIO':
        return {
            ...state,
            usuario: action.payload
        };

        case 'LOGOUT_USUARIO':
        return {
            ...initialState
        };

        // === PROYECTOS ===
        case 'SET_PROYECTOS':
        return {
            ...state,
            projects: action.payload
        };

        case 'ADD_PROYECTO':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.id]: action.payload
            }
        };

        case 'SELECT_PROYECTO':
        return {
            ...state,
            activeProject: action.payload
        };

        case 'UPDATE_PROYECTO':
            return {
                ...state,
                projects: {
                ...state.projects,
                [action.payload.id]: {
                    ...state.projects[action.payload.id],
                    ...action.payload.proyecto
                }
                }
            };
        // === TASKS ===
        case 'SET_TASKS':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                tasks: action.payload.tasks,
                taskIds: Object.keys(action.payload.tasks)
            }
            }
        };

        case 'ADD_TASK':
        const { projectId: pId, task } = action.payload;
        return {
            ...state,
            projects: {
            ...state.projects,
            [pId]: {
                ...state.projects[pId],
                tasks: {
                ...state.projects[pId].tasks,
                [task.id]: task
                },
                taskIds: [...state.projects[pId].taskIds, task.id]
            }
            }
        };

        case 'UPDATE_TASK':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                tasks: {
                ...state.projects[action.payload.projectId].tasks,
                [action.payload.task.id]: action.payload.task
                }
            }
            }
        };

        case 'DELETE_TASK':
        const { projectId, taskId } = action.payload;
        const { [taskId]: deletedTask, ...remainingTasks } = state.projects[projectId].tasks;
        return {
            ...state,
            projects: {
            ...state.projects,
            [projectId]: {
                ...state.projects[projectId],
                tasks: remainingTasks,
                taskIds: state.projects[projectId].taskIds.filter(id => id !== taskId)
            }
            }
        };

        case 'MOVE_KANBAN_ITEM':
        const { projectId: kanbanPId, itemId: kanbanItemId, newStatus, type } = action.payload;

        const collectionKey =
            type === 'tasks' ?
            'tasks' :
            type === 'userStories' ? 'userStories' : 'bugs';

        const currentItem = (state.projects[kanbanPId] as any)[collectionKey][kanbanItemId];

        return {
            ...state,
            projects: {
                ...state.projects,
                [kanbanPId]: {
                    ...state.projects[kanbanPId],
                    [collectionKey]: {
                    ...((state.projects[kanbanPId] as any)[collectionKey]),
                    [kanbanItemId]: {
                        ...currentItem,
                        status_khanban: newStatus
                    }
                    }
                }
            }
        };

        // === USER STORIES ===
        case 'ADD_USER_STORY':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                userStories: {
                ...state.projects[action.payload.projectId].userStories,
                [action.payload.userStory.uuid]: action.payload.userStory
                },
                userStoryIds: [...state.projects[action.payload.projectId].userStoryIds, action.payload.userStory.uuid]
            }
            }
        };
        
        case 'UPDATE_USER_STORY':
            return {
                ...state,
                projects: {
                ...state.projects,
                [action.payload.projectId]: {
                    ...state.projects[action.payload.projectId],
                    userStories: {
                    ...state.projects[action.payload.projectId].userStories,
                    [action.payload.userStory.uuid]: action.payload.userStory
                    }
                }
                }
            };

        case 'DELETE_USER_STORY':
            const { projectId: usProjectId, userStoryId } = action.payload;
            const { [userStoryId]: deletedUS, ...remainingUS } = state.projects[usProjectId].userStories;
            return {
                ...state,
                projects: {
                ...state.projects,
                [usProjectId]: {
                    ...state.projects[usProjectId],
                    userStories: remainingUS,
                    userStoryIds: state.projects[usProjectId].userStoryIds.filter(id => id !== userStoryId)
                }
                }
            };
        

        // === EPICS ===
        case 'ADD_EPIC':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                epics: {
                ...state.projects[action.payload.projectId].epics,
                [action.payload.epic.uuid]: action.payload.epic
                },
                epicIds: [...state.projects[action.payload.projectId].epicIds, action.payload.epic.uuid]
            }
            }
        };
        
        case 'UPDATE_EPIC':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                epics: {
                ...state.projects[action.payload.projectId].epics,
                [action.payload.epic.uuid]: action.payload.epic
                }
            }
            }
        };
        
        case 'DELETE_EPIC':
            const { projectId: epicProjectId, epicId } = action.payload;
            const { [epicId]: deletedEpic, ...remainingEpics } = state.projects[epicProjectId].epics;
            return {
                ...state,
                projects: {
                ...state.projects,
                [epicProjectId]: {
                    ...state.projects[epicProjectId],
                    epics: remainingEpics,
                    epicIds: state.projects[epicProjectId].epicIds.filter(id => id !== epicId)
                }
                }
            };
        
        // === SPRINTS ===
        case 'ADD_SPRINT':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                sprints: {
                ...state.projects[action.payload.projectId].sprints,
                [action.payload.sprint.id]: action.payload.sprint
                },
                sprintIds: [...state.projects[action.payload.projectId].sprintIds, action.payload.sprint.id]
            }
            }
        };
        
        case 'UPDATE_SPRINT':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                sprints: {
                ...state.projects[action.payload.projectId].sprints,
                [action.payload.sprint.id]: action.payload.sprint
                }
            }
            }
        };
        
        case 'DELETE_SPRINT':
            const { projectId: sprintProjectId, sprintId } = action.payload;
            const { [sprintId]: deletedSprint, ...remainingSprints } = state.projects[sprintProjectId].sprints;
            return {
                ...state,
                projects: {
                ...state.projects,
                [sprintProjectId]: {
                    ...state.projects[sprintProjectId],
                    sprints: remainingSprints,
                    sprintIds: state.projects[sprintProjectId].sprintIds.filter(id => id !== sprintId)
                }
                }
            };
        
        // === BUGS ===
        case 'ADD_BUG':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                bugs: {
                ...state.projects[action.payload.projectId].bugs,
                [action.payload.bug.id]: action.payload.bug
                },
                bugIds: [...state.projects[action.payload.projectId].bugIds, action.payload.bug.id]
            }
            }
        };
        
        case 'UPDATE_BUG':
            return {
                ...state,
                projects: {
                ...state.projects,
                [action.payload.projectId]: {
                    ...state.projects[action.payload.projectId],
                    bugs: {
                    ...state.projects[action.payload.projectId].bugs,
                    [action.payload.bug.id]: action.payload.bug
                    }
                }
                }
            };
        
        case 'DELETE_BUG':
            const { projectId: bugProjectId, bugId } = action.payload;
            const { [bugId]: deletedBug, ...remainingBugs } = state.projects[bugProjectId].bugs;
            return {
                ...state,
                projects: {
                ...state.projects,
                [bugProjectId]: {
                    ...state.projects[bugProjectId],
                    bugs: remainingBugs,
                    bugIds: state.projects[bugProjectId].bugIds.filter(id => id !== bugId)
                }
                }
            };

        // === REQUIREMENTS ===
        case 'ADD_REQUIREMENT':
        return {
            ...state,
            projects: {
            ...state.projects,
            [action.payload.projectId]: {
                ...state.projects[action.payload.projectId],
                requirements: {
                ...state.projects[action.payload.projectId].requirements,
                [action.payload.requirement.uuid]: action.payload.requirement
                },
                requirementIds: [...state.projects[action.payload.projectId].requirementIds, action.payload.requirement.uuid]
            }
            }
        };
        
        case 'UPDATE_REQUIREMENT':
            return {
                ...state,
                projects: {
                ...state.projects,
                [action.payload.projectId]: {
                    ...state.projects[action.payload.projectId],
                    requirements: {
                    ...state.projects[action.payload.projectId].requirements,
                    [action.payload.requirement.uuid]: action.payload.requirement
                    }
                }
                }
            };
        
        case 'DELETE_REQUIREMENT':
            const { projectId: reqProjectId, requirementId } = action.payload;
            const { [requirementId]: deletedRequirement, ...remainingRequirements } = state.projects[reqProjectId].requirements;
            return {
                ...state,
                projects: {
                ...state.projects,
                [reqProjectId]: {
                    ...state.projects[reqProjectId],
                    requirements: remainingRequirements,
                    requirementIds: state.projects[reqProjectId].requirementIds.filter(id => id !== requirementId)
                }
                }
            };


        case 'SET_ERROR':
        return {
            ...state,
            error: action.payload.message
        };

        default:
        return state;
        
        case 'INCREMENT_LOADING':
        return { ...state, loadingCount: state.loadingCount + 1 };
        
        case 'DECREMENT_LOADING':
        return { ...state, loadingCount: state.loadingCount - 1 };
    
        case 'SET_RESOURCE': {
        const { projectId, resource, data } = action.payload;
        return {
            ...state,
            projects: {
                ...state.projects,
                [projectId]: {
                    ...state.projects[projectId],
                    [resource]: data,
                    loaded: {
                    ...state.projects[projectId].loaded,
                    [resource]: true
                    }
                }
            }
        };
        }


    }
};