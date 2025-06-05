import type { Sprint } from "@/types/sprint";
import { getProjectSprints } from "@/utils/getProjectSprints";

export interface DateValidation {
  isValid: boolean;
  message?: string;
}

export async function validateSprintDates(
  startDate: string,
  endDate: string,
  projectId: string,
  currentSprintId: string
): Promise<DateValidation> {
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. No permitir fechas pasadas para nuevos sprints
  if (currentSprintId.startsWith("temp-") && startD < today) {
    return {
      isValid: false,
      message: "Cannot create sprints with past dates. Please select a date from today onwards."
    };
  }

  // 2. End date debe ser después de start date
  if (endD <= startD) {
    return {
      isValid: false,
      message: "End date must be after start date."
    };
  }

  // 3. Verificar que la duración no sea demasiado corta
  const diffTime = Math.abs(endD.getTime() - startD.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return {
      isValid: false,
      message: "Sprint duration must be at least 1 week."
    };
  }

  // 4. Verificar solapamiento con otros sprints
  try {
    const projectSprints = await getProjectSprints(projectId);
    
    const overlappingSprint = projectSprints.find(existingSprint => {
      // Saltar el sprint actual si estamos editando
      if (existingSprint.id === currentSprintId) return false;

      const existingStart = new Date(existingSprint.start_date);
      const existingEnd = new Date(existingSprint.end_date);

      // Verificar solapamiento
      return (
        (startD >= existingStart && startD < existingEnd) ||
        (endD > existingStart && endD <= existingEnd) ||
        (startD <= existingStart && endD >= existingEnd)
      );
    });

    if (overlappingSprint) {
      return {
        isValid: false,
        message: `Dates overlap with sprint "${overlappingSprint.name}" (${new Date(overlappingSprint.start_date).toLocaleDateString()} - ${new Date(overlappingSprint.end_date).toLocaleDateString()}). Please select different dates.`
      };
    }

    return {
      isValid: true,
      message: ""
    };

  } catch (error) {
    console.error("Error validating sprint dates:", error);
    return {
      isValid: true,
      message: "Warning: Could not validate against existing sprints."
    };
  }
}