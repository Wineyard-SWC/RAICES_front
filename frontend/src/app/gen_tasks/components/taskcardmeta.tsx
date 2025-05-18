import React from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface TaskCardMetaProps {
  createdBy?: [string, string]; // [userId, userName]
  createdDate?: string;
  modifiedBy?: [string, string]; // [userId, userName]
  modifiedDate?: string;
  completedBy?: [string, string]; // [userId, userName]
  completedDate?: string;
}

const TaskCardMeta: React.FC<TaskCardMetaProps> = ({
  createdBy,
  createdDate,
  modifiedBy,
  modifiedDate,
  completedBy,
  completedDate,
}) => {
  // Función para formatear fechas relativas (ej: "hace 2 días")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true});
    } catch (e) {
      return "";
    }
  };

  // Mostrar la información más relevante (completado > modificado > creado)
  const getDisplayInfo = () => {
    if (completedDate && completedBy && completedBy[1]) {
      return {
        name: completedBy[1],
        date: formatDate(completedDate),
        action: "completed",
      };
    }
    if (modifiedDate && modifiedBy && modifiedBy[1]) {
      return {
        name: modifiedBy[1],
        date: formatDate(modifiedDate),
        action: "modified",
      };
    }
    if (createdDate && createdBy && createdBy[1]) {
      return {
        name: createdBy[1],
        date: formatDate(createdDate),
        action: "created",
      };
    }
    return null;
  };

  const info = getDisplayInfo();
  if (!info) return null;

  return (
    <div className="text-sm text-black mt-2">
      <span className="font-medium">{info.name}</span> {info.action} {info.date}
    </div>
  );
};

export default TaskCardMeta;