"use client";

import React, { createContext, useContext, useState, ReactNode } from "react"; 
import { SuggestedPhase } from "@/app/roadmap/hooks/interfaces/useSuggestedRoadmapsProps";

interface RoadmapSuggestionsContextType {
  suggestions: SuggestedPhase[];
  setSuggestions: (phases: SuggestedPhase[]) => void;
  clearSuggestions: () => void;
}

const RoadmapSuggestionsContext = createContext<RoadmapSuggestionsContextType | undefined>(undefined);

export function RoadmapSuggestionsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<SuggestedPhase[]>([]);

  const clearSuggestions = () => setSuggestions([]);

  return (
    <RoadmapSuggestionsContext.Provider value={{ suggestions, setSuggestions, clearSuggestions }}>
      {children}
    </RoadmapSuggestionsContext.Provider>
  );
}

export function useRoadmapSuggestions() {
  const ctx = useContext(RoadmapSuggestionsContext);
  if (!ctx) throw new Error("useRoadmapSuggestions must be used within a RoadmapSuggestionsProvider");
  return ctx;
}