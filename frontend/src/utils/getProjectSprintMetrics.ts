import { Sprint } from "@/types/sprint";
import { UserStory } from "@/types/userstory";
import { Task } from "@/types/task";
import { Bug } from "@/types/bug"; // Añadir esta importación
import { getProjectSprints } from "@/utils/getProjectSprints";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { getProjectTasks } from "@/utils/getProjectTasks";
import { getProjectBugs } from "@/utils/getProjectBugs";

export interface SprintMetric {
  sprintId: string;
  sprintName: string;
  status: string;
  totalPoints: number;
  completedPoints: number;
  completionPercentage: number;
  daysRemaining: number;
  totalDuration: number;
  teamSize: number;
  selectedStories: UserStory[];
  completedStories: UserStory[];
  bugsCount: number;
  tasksCount: number;           
  sprintTasks: Task[];          
  completedTasks: Task[];       
  startDate: string;
  endDate: string;
}

export async function getProjectSprintMetrics(projectId: string): Promise<SprintMetric[]> {
  try {
    // 1. Obtener todos los sprints del proyecto
    const sprints = await getProjectSprints(projectId);
    
    if (sprints.length === 0) {
      console.info("No se encontraron sprints para este proyecto");
      return [];
    }
    
    // 2. Obtener todas las historias de usuario del proyecto
    const allUserStories = await getProjectUserStories(projectId);
    
    // 3. Obtener todas las tareas del proyecto
    const allTasks = await getProjectTasks(projectId);
    
    // 4. Obtener todos los bugs del proyecto
    let allBugs: Bug[] = []; // Especificar el tipo explícitamente
    try {
      allBugs = await getProjectBugs(projectId);
    } catch (error) {
      console.warn("No se pudieron cargar los bugs del proyecto:", error);
      allBugs = [];
    }
    
    // 5. Calcular métricas para cada sprint
    const sprintMetrics = await Promise.all(
      sprints.map(async (sprint) => {
        // Extraer IDs de historias seleccionadas para este sprint
        const sprintStoryIds = sprint.user_stories
          .filter(story => story.selected)
          .map(story => story.id);
        
        // Filtrar historias que pertenecen a este sprint
        const selectedStories = allUserStories.filter(story => {
          return sprintStoryIds.includes(story.id) || sprintStoryIds.includes(story.uuid);
        });
        
        // Extraer TODOS los identificadores posibles de las historias seleccionadas
        const selectedStoryIdentifiers = selectedStories.flatMap(story => 
          [story.id, story.uuid].filter(Boolean)
        );
        
        // Filtrar tareas asociadas a este sprint
        const sprintTasks = allTasks.filter(task => {
          // Si la tarea tiene sprint_id directo
          if (task.sprint_id === sprint.id) return true;
          
          // Si la tarea está relacionada con una user story del sprint
          if (task.user_story_id && selectedStoryIdentifiers.includes(task.user_story_id)) return true;
          
          return false;
        });
        
        // Calcular historias completadas basándose en el estado de sus tareas
        const completedStories = selectedStories.filter(story => {
          // Encontrar todas las tareas asociadas a esta historia
          const storyTasks = sprintTasks.filter(task => 
            task.user_story_id === story.id || task.user_story_id === story.uuid
          );
          
          // Si la historia no tiene tareas asociadas, no se considera completada
          if (storyTasks.length === 0) {
            return false;
          }
          
          // La historia está completa solo si TODAS sus tareas están en "Done"
          return storyTasks.every(task => task.status_khanban === 'Done');
        });
        
        // Filtrar bugs asociados a este sprint
        const sprintBugs = allBugs.filter(bug => {
          // Si el bug tiene sprint_id directamente
          if (bug.sprintId === sprint.id) return true;
          
          // Si el bug está relacionado con una user story del sprint
          if (bug.userStoryRelated && selectedStoryIdentifiers.includes(bug.userStoryRelated)) return true;
          
          return false;
        });
        
        // Tareas completadas
        const completedTasks = sprintTasks.filter(
          task => task.status_khanban === 'Done'
        );
        
        // Calcular puntos totales 
        const totalPointsFromTasks = sprintTasks.reduce(
          (sum, task) => sum + (task.story_points || 0), 
          0
        );
        
        // Solo usar puntos de historias si no hay puntos en las tareas
        const totalPointsFromStories = totalPointsFromTasks === 0 
          ? selectedStories.reduce((sum, story) => sum + (story.points || 0), 0)
          : 0;
        
        // Calcular puntos completados - PRIORIZAR puntos de tareas completadas
        const completedPointsFromTasks = completedTasks.reduce(
          (sum, task) => sum + (task.story_points || 0), 
          0
        );
        
        // Solo usar puntos de historias completadas si no hay puntos en las tareas
        const completedPointsFromStories = completedPointsFromTasks === 0
          ? completedStories.reduce((sum, story) => sum + (story.points || 0), 0)
          : 0;
        
        // Usar los puntos de las tareas
        const finalTotalPoints = totalPointsFromTasks > 0 ? totalPointsFromTasks : totalPointsFromStories;
        const finalCompletedPoints = completedPointsFromTasks > 0 ? completedPointsFromTasks : completedPointsFromStories;
        
        // Calcular días restantes
        const startDate = new Date(sprint.start_date);
        const endDate = new Date(sprint.end_date);
        const currentDate = new Date();
        
        const totalDurationMs = endDate.getTime() - startDate.getTime();
        const totalDurationDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));
        
        // Calcular días restantes (máximo 0, no mostrar negativos)
        const daysRemaining = Math.max(
          0, 
          Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        
        return {
          sprintId: sprint.id,
          sprintName: sprint.name,
          status: sprint.status,
          totalPoints: finalTotalPoints,
          completedPoints: finalCompletedPoints,
          completionPercentage: finalTotalPoints > 0 
            ? Math.round((finalCompletedPoints / finalTotalPoints) * 100) 
            : 0,
          daysRemaining,
          totalDuration: totalDurationDays,
          teamSize: sprint.team_members.length,
          selectedStories,
          completedStories, 
          bugsCount: sprintBugs.length,
          tasksCount: sprintTasks.length,
          sprintTasks,
          completedTasks,
          startDate: sprint.start_date,
          endDate: sprint.end_date
        };
      })
    );
    
    return sprintMetrics;
    
  } catch (error) {
    console.error("Error obteniendo métricas de los sprints:", error);
    return [];
  }
}

// Función auxiliar para obtener el sprint currente (activo) si existe
export async function getCurrentSprintMetric(projectId: string): Promise<SprintMetric | null> {
  const metrics = await getProjectSprintMetrics(projectId);
  return metrics.find(metric => metric.status === "active") || metrics[0] || null;
}