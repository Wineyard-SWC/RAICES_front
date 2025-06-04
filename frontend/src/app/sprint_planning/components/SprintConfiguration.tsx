"use client"

import { useState, useEffect } from "react"
import { Calendar, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Sprint, ProjectSprintDates } from "@/types/sprint"
import { getProjectSprints } from "@/utils/getProjectSprints"
import { validateSprintDates } from "@/utils/validateSprintDates"

interface SprintConfigurationProps {
  sprint: Sprint & { max_points?: number }
  onUpdate: (data: Partial<Sprint>) => void
}

export default function SprintConfiguration({ sprint, onUpdate }: SprintConfigurationProps) {
  const [name, setName] = useState(sprint.name || "New Sprint");
  const [duration, setDuration] = useState(() => String(sprint.duration_weeks ?? 2));
  const [startDate, setStartDate] = useState(() => {
    const d = sprint.start_date ? new Date(sprint.start_date) : new Date();
    return d.toISOString().split("T")[0];
  });  
  const [endDate, setEndDate] = useState(() => {
    const d = sprint.end_date ? new Date(sprint.end_date) : new Date(Date.now() + (parseInt(duration) || 2) * 7 * 24*60*60*1000);
    return d.toISOString().split("T")[0];
  });
  
  // Estados para validación - FIX: Asegurar que message siempre sea string
  const [projectSprints, setProjectSprints] = useState<ProjectSprintDates[]>([]);
  const [dateValidation, setDateValidation] = useState<{ isValid: boolean; message: string }>({ 
    isValid: true, 
    message: "" 
  });
  
  const totalCapacity = (sprint.team_members || []).reduce(
    (sum, m) => sum + (m?.capacity ?? 0),
    0
  );
  const [capacity, setCapacity] = useState(totalCapacity.toString());

  // Cargar sprints del proyecto para validación
  useEffect(() => {
    if (!sprint.project_id) return
    getProjectSprints(sprint.project_id).then(setProjectSprints)
  }, [sprint.project_id])

  // Validar fechas iniciales
  useEffect(() => {
    const validateInitialDates = async () => {
      const validation = await validateSprintDates(
        startDate,
        endDate,
        sprint.project_id,
        sprint.id
      );
      
      // FIX: Asegurar que message siempre sea string
      setDateValidation({
        isValid: validation.isValid,
        message: validation.message || ""
      });
    };
    
    if (projectSprints.length > 0) {
      validateInitialDates();
    }
  }, [projectSprints, sprint.project_id, sprint.id, startDate, endDate]);

  // Función para obtener la fecha mínima permitida
  const getMinDate = () => {
    if (sprint.id.startsWith("temp-")) {
      // Para sprints nuevos, no permitir fechas pasadas
      return new Date().toISOString().split("T")[0];
    }
    // Para sprints existentes, permitir cualquier fecha
    return undefined;
  };

  // Función para generar fechas bloqueadas para el calendario HTML
  const getBlockedDatesForCalendar = (): string => {
    const blocked: string[] = [];
    
    // 1. Bloquear fechas pasadas para sprints temporales
    if (sprint.id.startsWith("temp-")) {
      const today = new Date();
      for (let i = 1; i <= 365; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        blocked.push(pastDate.toISOString().split("T")[0]);
      }
    }
    
    // 2. Bloquear fechas ocupadas por otros sprints
    projectSprints.forEach(existingSprint => {
      if (existingSprint.id === sprint.id) return; // Saltar el sprint actual
      
      const start = new Date(existingSprint.start_date);
      const end = new Date(existingSprint.end_date);
      
      // Generar todas las fechas entre start y end
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        blocked.push(d.toISOString().split("T")[0]);
      }
    });
    
    // Convertir a string para usar en el atributo disabled del input
    return blocked.join(',');
  };

  const handleSubmit = async () => {
    const validation = await validateSprintDates(
      startDate,
      endDate,
      sprint.project_id,
      sprint.id
    );
    
    // FIX: Asegurar que message siempre sea string
    setDateValidation({
      isValid: validation.isValid,
      message: validation.message || ""
    });
    
    if (validation.isValid) {
      onUpdate({ 
        name, 
        duration_weeks: +duration, 
        start_date: new Date(startDate).toISOString(), 
        end_date: new Date(endDate).toISOString() 
      });
    }
  };

  const handleStartDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);

    const weeks = parseInt(duration) || 2;
    const end = new Date(newStart);
    end.setDate(end.getDate() + weeks * 7);
    const newEndDate = end.toISOString().split("T")[0];
    setEndDate(newEndDate);

    // Validar inmediatamente
    const validation = await validateSprintDates(newStart, newEndDate, sprint.project_id, sprint.id);
    
    // FIX: Asegurar que message siempre sea string
    setDateValidation({
      isValid: validation.isValid,
      message: validation.message || ""
    });
    
    if (validation.isValid) {
      onUpdate({
        name,
        duration_weeks: parseInt(duration) || 2,
        start_date: new Date(newStart).toISOString(),
        end_date: new Date(newEndDate).toISOString(),
      });
    }
  };

  const handleEndDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndDate(newEnd);
    
    // Validar inmediatamente
    const validation = await validateSprintDates(startDate, newEnd, sprint.project_id, sprint.id);
    
    // FIX: Asegurar que message siempre sea string
    setDateValidation({
      isValid: validation.isValid,
      message: validation.message || ""
    });
    
    if (validation.isValid) {
      onUpdate({
        name,
        duration_weeks: parseInt(duration) || 2,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(newEnd).toISOString(),
      });
    }
  };

  const handleDurationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const weeks = e.target.value;
    setDuration(weeks);

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (parseInt(weeks) || 2) * 7);
    const newEndDate = end.toISOString().split("T")[0];
    setEndDate(newEndDate);

    // Validar inmediatamente
    const validation = await validateSprintDates(startDate, newEndDate, sprint.project_id, sprint.id);
    
    // FIX: Asegurar que message siempre sea string
    setDateValidation({
      isValid: validation.isValid,
      message: validation.message || ""
    });
    
    if (validation.isValid) {
      onUpdate({
        name,
        duration_weeks: parseInt(weeks) || 2,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(newEndDate).toISOString(),
      });
    }
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const total = parseInt(e.target.value, 10) || 0;
    setCapacity(e.target.value);

    const members = sprint.team_members || [];
    const count = members.length;
    if (count > 0) {
      const base      = Math.floor(total / count);
      const remainder = total % count;

      const updatedMembers = members.map((m, i) => ({
        ...m,
        capacity: base + (i < remainder ? 1 : 0),
      }));

      onUpdate({ team_members: updatedMembers });
    }
  };

  // REMOVED: isDateBlocked function since it's not being used and browsers handle date blocking differently

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
      <h2 className="mb-4 text-xl font-bold">Sprint Configuration</h2>

      {/* Mostrar mensaje de validación de error */}
      {!dateValidation.isValid && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{dateValidation.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sprint name</label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              handleSubmit()
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Duration (weeks)</label>
          <Input 
            type="number" 
            min="1" 
            max="8" 
            value={duration} 
            onChange={handleDurationChange} 
            className="w-full" 
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
            Start Date
            {/* Tooltip discreto */}
            <div className="relative group">
              <div className="w-4 h-4 rounded-full bg-gray-300 text-white text-xs flex items-center justify-center cursor-help font-bold">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden w-64 rounded-md bg-gray-800 p-3 text-xs text-white group-hover:block z-10 shadow-lg">
                <div className="text-center">
                  <strong>Date Restrictions:</strong>
                  <br />
                  • Dates occupied by other sprints are blocked
                  {sprint.id.startsWith("temp-") && (
                    <>
                      <br />
                      • Past dates are blocked for new sprints
                    </>
                  )}
                </div>
              </div>
            </div>
          </label>
          <div className="relative">
            <Input 
              type="date" 
              value={startDate} 
              onChange={handleStartDateChange} 
              className={`w-full pl-9 ${!dateValidation.isValid ? 'border-red-300' : ''}`}
              min={getMinDate()}
            />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
          <div className="relative">
            <Input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className={`w-full pl-9 ${!dateValidation.isValid ? 'border-red-300' : ''}`}
              min={startDate}
            />
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Team Capacity (Story Points)</label>
          <Input
            type="number"
            min="0"
            value={capacity}
            onChange={handleCapacityChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
