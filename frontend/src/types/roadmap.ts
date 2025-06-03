import { Node } from "@xyflow/react";
import { Bug } from './bug';
import { Task } from './task';
import { UserStory } from './userstory';
import { isBug } from "./taskkanban";
import { isTask } from "./taskkanban";
import { isUserStory } from "./taskkanban";

//Tipos de items que puede tener el roadmap
export type RoadmapItem = Bug | Task | UserStory;

//Funciones para obtener el tipo, titulo e id de un item del roadmap
export function getItemType(item: RoadmapItem): 'bug' | 'task' | 'user-story' {
  if (isBug(item)) return 'bug';
  if (isTask(item)) return 'task';
  if (isUserStory(item)) return 'user-story';
  throw new Error('Unknown item type');
}

export function getItemTitle(item: RoadmapItem): string {
  return item.title;
}

export function getItemId(item: RoadmapItem): string {
  if (isUserStory(item)) return item.uuid;
  return item.id;
}

export function getItemPriority(item: RoadmapItem): string  {
    if ('priority' in item) return item.priority;
    return 'Medium';
  };

export function getItemStatus(item: RoadmapItem): string  {
    if ('status_khanban' in item && item.status_khanban) return item.status_khanban;
    return 'Backlog';
};

export interface SavedRoadmap {
  id: string;
  name: string;
  description?: string;
  items: RoadmapItem[];
  connections: RoadmapConnection[];
  phases: RoadmapPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description?: string;
  color: string;
  position: { x: number; y: number };
  items: string[]; 
  itemCount :number;
}

//Nodos y configuraciones para los items del roadmap
export type NodeData = {
  type: 'user-story' | 'task' | 'bug'| 'phase';
  id: string;
  title: string;
  originalData: RoadmapItem | RoadmapPhase;
  phaseId: string;
  isCollapsed: boolean;
  hasCollapsibleChildren: boolean;
  hasConnections?: boolean;
};

export interface TypeConfig {
  color: string;
  icon: any;
  label: string;
}

//Interface para el componente task card del roadmap
export interface TaskCardProps {
  data: NodeData;
  isConnectable?: boolean;
}

export interface PhaseCardProps {
  data: NodeData;
  isConnectable?: boolean;
}

//Interface para el componente encargado de mostrar el panel de control del roadmap
export interface ControlPanelProps {
  onAddNode: (type: 'user-story' | 'task' | 'bug') => void;
}

//Interface para el componente encargado de mostrar el panel de detalles de la carta seleccionada en el roadmap
export interface DetailPanelProps {
  selectedNode: Node<NodeData> | null;
  onClose: () => void;
}

//Interface para mostrar conexiones entre items del roadmap
export interface RoadmapConnection {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'relation' | 'parent-child';
  sourceHandle?: string;
  targetHandle?: string;
}

//Interface para los cambios en el roadmap
export interface RoadmapChanges {
  addedConnections: RoadmapConnection[];
  removedConnections: RoadmapConnection[];
  modifiedItems: RoadmapItem[];
  hasUnsavedChanges: boolean;
}


//Función para extraer relaciones entre items del roadmap
export function extractRelationsFromItem(item: RoadmapItem): RoadmapConnection[] {
  const connections: RoadmapConnection[] = [];
  const itemId = getItemId(item);

  if (getItemType(item) === 'bug') {
    const bug = item as Bug;
    
    if (bug.taskRelated) {
      connections.push({
        id: `${itemId}-${bug.taskRelated}`,
        source: bug.taskRelated,
        target: itemId,
        type: 'relation'
      });
    }
    
    if (bug.userStoryRelated) {
      connections.push({
        id: `${bug.userStoryRelated}-${itemId}`,
        source: bug.userStoryRelated,
        target: itemId,
        type: 'parent-child'
      });
    }
    
    bug.relatedBugs?.forEach(relatedBugId => {
      connections.push({
        id: `${itemId}-${relatedBugId}`,
        source: itemId,
        target: relatedBugId,
        type: 'relation'
      });
    });
  }
  
  if (getItemType(item) === 'task') {
    const task = item as Task;
    
    if (task.user_story_id) {
      connections.push({
        id: `${task.user_story_id}-${itemId}`,
        source: task.user_story_id,
        target: itemId,
        type: 'parent-child'
      });
    }
  }
  
  if (getItemType(item) === 'user-story') {
    const userStory = item as UserStory;
    
    userStory.task_list?.forEach(taskId => {
      connections.push({
        id: `${itemId}-${taskId}`,
        source: itemId,
        target: taskId,
        type: 'parent-child'
      });
    });
  }

  return connections;
}

//Funcion para manejar los cambios de conexiones en un item del roadmap
export function applyConnectionChangesToItem(
  item: RoadmapItem,
  connections: RoadmapConnection[]
): RoadmapItem {
  const itemId = getItemId(item);
  const itemType = getItemType(item);
  const updatedItem = { ...item };


  if (itemType === 'bug') {
    const bug = updatedItem as Bug;
    
    const parentConnections = connections.filter(
      conn => conn.target === itemId && conn.type === 'parent-child'
    );
    const taskConnections = connections.filter(
      conn => conn.target === itemId && conn.type === 'relation'
    );
    //Asignar relaciones de usuario historia y tarea si es que existen  
    bug.userStoryRelated = parentConnections[0]?.source || undefined;
    bug.taskRelated = taskConnections[0]?.source || undefined;
    
    // Encontrar bugs relacionados si es que existen
    bug.relatedBugs = connections
      .filter(conn => conn.source === itemId && conn.type === 'relation')
      .map(conn => conn.target);
  }
  
  if (itemType === 'task') {
    const task = updatedItem as Task;
    
    const parentConnection = connections.find(
      conn => conn.target === itemId && conn.type === 'parent-child'
    );
    
    task.user_story_id = parentConnection?.source || '';
  }
  
  if (itemType === 'user-story') {
    const userStory = updatedItem as UserStory;
    
    userStory.task_list = connections
      .filter(conn => conn.source === itemId && conn.type === 'parent-child')
      .map(conn => conn.target);
  }

  return updatedItem;
}