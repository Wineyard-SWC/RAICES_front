"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./loadingTasks.css";

interface LoadingTasksProps {
  isLoading: boolean;
}

// Mensajes específicos para la generación de tasks
const TASK_LOADING_MESSAGES = [
  "Reading selected user stories",
  "Analyzing story complexity",
  "Planning sub-tasks",
  "Generating tasks",
  "Organizing results",
];

// Hook que controla la aparición progresiva de mensajes
function useLoadingMessages(isLoading: boolean) {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setVisibleMessages([]);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      setVisibleMessages((prev) => {
        if (currentIndex < TASK_LOADING_MESSAGES.length) {
          return [...prev, TASK_LOADING_MESSAGES[currentIndex++]];
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  return visibleMessages;
}

const LoadingTasks: React.FC<LoadingTasksProps> = ({ isLoading }) => {
  const visibleMessages = useLoadingMessages(isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#F5F0F1] flex flex-col items-center pt-8 overflow-auto"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Barra de arrastre */}
          <div className="h-2 w-20 bg-gray-300 mx-auto mb-4 rounded-full" />

          {/* SVG de la regadera animada */}
          <div className="svg-holder svg-holder--p mb-6">
            <svg
              preserveAspectRatio="xMinYMin"
              viewBox="-10 -30 140 149"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Inserta aquí tu <g class="can-group"> con paths... */}
            </svg>
          </div>
{/* 
          {/* Iframe de la planta }
          <div className="w-full max-w-6xl h-[50vh] mb-6">
            <iframe
              src="/animation/plant.html"
              title="Generating Tasks Animation"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div> */}

          {/* Mensajes progresivos */}
          <div className="space-y-2 text-lg text-[#4a2a4a] font-medium px-6 pt-4">
            {visibleMessages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-2xl">•</span>
                <span className="text-xl">{msg}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingTasks;
