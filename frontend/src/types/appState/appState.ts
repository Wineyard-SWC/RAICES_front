import { Project } from "../project";
import { Task } from "../task";
import { UserStory } from "../userstory";
import { Requirement } from "../requirement";
import { Epic } from "../epic";
import { Sprint } from "../sprint";
import { Bug } from "../bug";

export interface ProjectState extends Omit<Project, 'sprints'> {
    tasks: Record<string, Task>;
    userStories: Record<string, UserStory>;
    requirements: Record<string, Requirement>;
    epics: Record<string, Epic>;
    sprints: Record<string, Sprint>;
    bugs: Record<string, Bug>;
    
    taskIds: string[];
    userStoryIds: string[];
    requirementIds: string[];
    epicIds: string[];
    sprintIds: string[];
    bugIds: string[];

    loaded: {
        tasks: boolean;
        userStories: boolean;
        bugs: boolean;
        requirements: boolean;
        epics: boolean;
        sprints: boolean;
    };
}

export interface AppState {
  usuario: {
    id: string | null;
    nombre: string;
    email: string;
    rol: string;
  };
  
  projects: Record<string, ProjectState>;
  
  activeProject: string | null;
  
  loadingCount: number;         
  error: string | null;
}



export const initialState: AppState = {
  usuario: {
    id: null,
    nombre: '',
    email: '',
    rol: ''
  },
  projects: {},
  activeProject: null,
  loadingCount: 0,
  error: null
};