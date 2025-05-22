import { Sprint } from "@/types/sprint";
import { UserStory } from "@/types/userstory";
import { Task } from "@/types/task";
import { getProjectSprints } from "@/utils/getProjectSprints";
import { getProjectUserStories } from "@/utils/getProjectUserStories";
import { getProjectTasks } from "@/utils/getProjectTasks";

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
    
    // 4. Calcular métricas para cada sprint
    const sprintMetrics = await Promise.all(
      sprints.map(async (sprint) => {
        // Extraer IDs de historias seleccionadas para este sprint
        const sprintStoryIds = sprint.user_stories
          .filter(story => story.selected)
          .map(story => story.id);
        
        // Filtrar historias que pertenecen a este sprint
        const selectedStories = allUserStories.filter(
          story => sprintStoryIds.includes(story.id || story.uuid)
        );
        
        // Historias completadas (Done)
        const completedStories = selectedStories.filter(
          story => story.status_khanban === 'Done'
        );
        
        // Filtrar tareas asociadas a este sprint
        const sprintTasks = allTasks.filter(
          task => task.sprint_id === sprint.id || sprintStoryIds.includes(task.user_story_id || '')
        );
        
        // Tareas completadas
        const completedTasks = sprintTasks.filter(
          task => task.status_khanban === 'Done'
        );
        
        // Calcular puntos totales (sumando los puntos de historia o story_points de las tareas)
        const totalPoints = sprintTasks.reduce(
          (sum, task) => sum + (task.story_points || 0),
          0
        );
        
        // Si no hay story_points en las tareas, usar los points de las historias
        const totalPointsFromStories = totalPoints === 0 
          ? selectedStories.reduce((sum, story) => sum + (story.points || 0), 0)
          : 0;
        
        // Puntos completados
        const completedPoints = completedTasks.reduce(
          (sum, task) => sum + (task.story_points || 0),
          0
        );
        
        const completedPointsFromStories = completedPoints === 0
          ? completedStories.reduce((sum, story) => sum + (story.points || 0), 0)
          : 0;
        
        // Usar los puntos de las tareas si están disponibles, de lo contrario usar los de las historias
        const finalTotalPoints = totalPoints > 0 ? totalPoints : totalPointsFromStories;
        const finalCompletedPoints = completedPoints > 0 ? completedPoints : completedPointsFromStories;
        
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

// Función auxiliar para obtener el sprint actual (activo) si existe
export async function getCurrentSprintMetric(projectId: string): Promise<SprintMetric | null> {
  const metrics = await getProjectSprintMetrics(projectId);
  return metrics.find(metric => metric.status === "active") || metrics[0] || null;
}