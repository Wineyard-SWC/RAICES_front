export interface Comments{
    id: string
    user_id: string
    user_name: string
    text: string
    timestamp: string
}

export interface Workingusers {
    users: [string, string] //<- id del usuario participando y su nombre
}

export interface AcceptanceCriteriaData {
    id: string 
    description: string // <- Descripcion del criterio de aceptacion
    date_completed: string // <- Dia en que fue completada
    date_created: string   // <- Dia en que fue creada
    date_modified: string  // <- Dia en que fue la ultima modificacion
    // id del usuario que la termino y su nombre
    finished_by: [string, string]
    // id del usuario que la creo y su nombre 
    // en caso de ser creado por la ia los valores seran RAICES_IA,RAICES_IA 
    created_by:  [string, string]
    // id del ultimo usuario que la modifico y su nombre 
    modified_by: [string, string]
}

export interface UserStory {
    //Campos para page Generate
    uuid: string;
    assigned_epic: string;
    id: string; 
    idTitle: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    selected?: boolean

    //Campos para Generate Tasks, Dashboard
    acceptanceCriteria: AcceptanceCriteriaData[]
    points: number;
    
    //Campos para UserStory Dashboard
    comments?: Comments[];
    assignee?: Workingusers[];      // <- lista de id del usuario participando y su nombre
    projectRef?: string;     // <- id del projecto asignado
    total_tasks?: number;    // <- numero de tareas relacionadas a la historia de usuario 
    task_completed?: number; // <- numero de tareas completadas
    task_list?: string[]     // <- lista de tasks asignadas a una historia de usuario
    status_khanban?: 'Backlog'|'In Progress'|'In Review'|'To Do'|'Done' //<- status del khanban
    assigned_sprint?: string // <- id del sprint al que la historia de usuario fue asignados
    completed_acceptanceCriteria?: number  // <- Numero de criterios de aceptacion completados
    total_acceptanceCriteria?: number //<- Numero de criterios de aceptacion totales
    date_completed?:string //<- fecha de completado
    deadline?: string //<- fecha de deadline (fecha de finalizacion del sprint asignado)
};


export type UserStoryResponse = {
    content: UserStory[];
};