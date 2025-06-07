import { useEffect, useRef, useCallback } from 'react';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { useSelectedRequirementContext } from '@/contexts/selectedrequirements';
import { useEpicContext } from '@/contexts/epiccontext';
import { useSelectedEpicsContext } from '@/contexts/selectedepics';
import { useUserStoryContext } from '@/contexts/userstorycontext';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';
import { Requirement } from '@/types/requirement';
import { useGenerateRequirements } from '@/hooks/useGenerateRequirements';
import { parseRequirementsFromAPI } from '@/utils/parseRequirementsFromApi';
import { printError } from '@/utils/debugLogger';

export const useRequirementsLogic = ({
  projectDescription,
  setProjectDescription,
}: {
  projectDescription: string;
  setProjectDescription: (desc: string) => void;
}) => {
  const { requirements, setRequirements } = useRequirementContext();
  const { selectedIds, setSelectedIds } = useSelectedRequirementContext();
  const { epics, setEpics } = useEpicContext();
  const { setSelectedEpicIds} = useSelectedEpicsContext();
  const { setSelectedUserStoriesIds} = useSelectedUserStoriesContext();
  const { userStories,setUserStories} = useUserStoryContext();
  const selectedProject = typeof window !== 'undefined' ? 
    localStorage.getItem("currentProjectId") : null;
  const epicRefHistory = useRef<Map<string, string>>(new Map());

  const isEqualJSON = useCallback((a: any, b: any): boolean => {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }, []);

  const {
    generate,
    isLoading,
    generatedOutput,
    error
  } = useGenerateRequirements();

  useEffect(() => {
    if (generatedOutput && generatedOutput?.content) {
      try {
        const parsed = parseRequirementsFromAPI(generatedOutput);
        setRequirements(parsed);
      } catch (err) {
        printError("Error parsing generated requirements", err);
      }
    }
  }, [generatedOutput, setRequirements]);

  useEffect(() => {
    if (epics.length === 0 || requirements.length === 0) return;
  
    const reqMap = new Map(requirements.map(r => [r.uuid, r]));
    const selectedIdsSet = new Set(selectedIds);
    let changed = false;
  
    const updatedReqs = requirements.map(req => {
      if (
        selectedIdsSet.has(req.uuid) &&
        (!req.epicRef || req.epicRef === '') &&
        !epicRefHistory.current.has(req.uuid)
      ) {
        const matchedEpic = epics.find(e =>
          e.relatedRequirements.some(r => r.uuid === req.uuid)
        );
        if (matchedEpic) {
          epicRefHistory.current.set(req.uuid, matchedEpic.idTitle);
          changed = true;
          return { ...req, epicRef: matchedEpic.idTitle };
        }
      }
  
      if (
        selectedIdsSet.has(req.uuid) &&
        !req.epicRef &&
        epicRefHistory.current.has(req.uuid)
      ) {
        changed = true;
        return { ...req, epicRef: epicRefHistory.current.get(req.uuid) };
      }
  
      return req;
    });
  
    if (changed && !isEqualJSON(updatedReqs, requirements)) {
      setRequirements(updatedReqs);
    }
  
    const updatedEpics = epics.map(epic => {
      const currentRelated = epic.relatedRequirements.filter(r => selectedIdsSet.has(r.uuid));
      const newRelated = requirements.filter(r =>
        selectedIdsSet.has(r.uuid) &&
        epicRefHistory.current.get(r.uuid) === epic.idTitle &&
        !currentRelated.some(c => c.uuid === r.uuid)
      ).map(r => ({
        uuid: r.uuid,
        idTitle: r.idTitle,
        title: r.title,
        description: r.description
      }));
  
      const merged = [...currentRelated, ...newRelated];
      if (!isEqualJSON(merged, epic.relatedRequirements)) {
        return { ...epic, relatedRequirements: merged };
      }
      return epic;
    });
  
    if (!isEqualJSON(updatedEpics, epics)) {
      setEpics(updatedEpics);
    }
  }, [selectedIds, requirements, epics]);
  
  const resetEpicsAndUserStories = useCallback(() => {
    if (epics) {
      setEpics([]);
      setSelectedEpicIds([]);
    }
    
    if (userStories) {
      setUserStories([]);
      setSelectedUserStoriesIds([]);
    }
  }, [
    epics, 
    userStories, 
    setEpics, 
    setSelectedEpicIds, 
    setUserStories, 
    setSelectedUserStoriesIds
  ]);

  const handleGenerate = useCallback(() => {
    setSelectedIds([]);
    setRequirements([]);
    resetEpicsAndUserStories();

    if (projectDescription.trim() === "") return;
    generate(projectDescription);
  }, [
    projectDescription, 
    setSelectedIds, 
    setRequirements, 
    resetEpicsAndUserStories, 
    generate
  ]);

  const handleClear = useCallback(() => {
    setProjectDescription("");
    setRequirements([]);
    setSelectedIds([]);
    resetEpicsAndUserStories();
  }, [
    setProjectDescription, 
    setRequirements, 
    setSelectedIds, 
    resetEpicsAndUserStories
  ]);

  return {
    requirements,
    setRequirements,
    selectedIds,
    setSelectedIds,
    selectedProject,
    isLoading,
    error,
    handleGenerate,
    handleClear,
  };
};
