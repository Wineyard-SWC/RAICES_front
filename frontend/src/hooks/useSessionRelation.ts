"use client";

import { useState, useEffect } from "react";

export const useSessionRelation = () => {
  const [sessionRelationId, setSessionRelationId] = useState<string | null>(null);

  // Generar un nuevo ID de relación de sesión
  const generateSessionRelationId = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const newId = `research_session_${timestamp}_${randomId}`;
    setSessionRelationId(newId);
    
    // Opcionalmente guardarlo en localStorage para persistencia
    localStorage.setItem('currentSessionRelationId', newId);
    
    console.log("🔗 Generated new session relation ID:", newId);
    return newId;
  };

  // Cargar ID existente al inicializar
  useEffect(() => {
    const existingId = localStorage.getItem('currentSessionRelationId');
    if (existingId) {
      setSessionRelationId(existingId);
      console.log("🔗 Loaded existing session relation ID:", existingId);
    }
  }, []);

  // Limpiar la sesión (cuando terminas toda la evaluación)
  const clearSessionRelation = () => {
    setSessionRelationId(null);
    localStorage.removeItem('currentSessionRelationId');
    console.log("🧹 Cleared session relation ID");
  };

  return {
    sessionRelationId,
    generateSessionRelationId,
    clearSessionRelation
  };
};