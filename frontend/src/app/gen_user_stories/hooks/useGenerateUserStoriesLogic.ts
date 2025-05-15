'use client'

import { useState, useEffect, useRef, useMemo, useCallback} from 'react';
import { Epic } from '@/types/epic';
import { UserStory } from '@/types/userstory';
import { useGenerateUserStories } from '@/hooks/useGenerateUserStories';
import { parseUserStoriesFromAPI, parseUserStoriesFromDB } from '@/utils/parseUserStoriesFromApi';
import { groupUserStoriesByEpic } from '@/utils/groupUserStoriesByEpic';
import { useUserStoryContext } from '@/contexts/userstorycontext';
import { useEpicContext } from '@/contexts/epiccontext';
import { useSelectedEpicsContext } from '@/contexts/selectedepics';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';
import { postUserStories } from '@/utils/postUserStories';
import { getProjectEpics } from '@/utils/getProjectEpics';
import { reorderUserStoryIds } from '../utils/reorderUserStoryIds';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { useSelectedRequirementContext } from '@/contexts/selectedrequirements';
import { getProjectRequirements } from '@/utils/getProjectRequirements';
import { postEpics } from '@/utils/postEpics';
import saveRequirements from '@/app/gen_requirements/utils/handleSave';
import { useUserStories} from "@/contexts/saveduserstoriescontext";
import { useAssignmentContext } from '@/contexts/userstoriesepicsrelationshipcontext';
import { getProjectUserStories } from '@/utils/getProjectUserStories';
 

export const useGenerateUserStoriesLogic = () => {
  const { requirements, setRequirements } = useRequirementContext();
  const { selectedIds, setSelectedIds } = useSelectedRequirementContext();
  const [epicDescription, setEpicDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { userStories, setUserStories } = useUserStoryContext();
  const { epics, setEpics } = useEpicContext();
  const { selectedEpicIds, setSelectedEpicIds } = useSelectedEpicsContext();
  const { selectedUserStoriesIds, setSelectedUserStoriesIds } = useSelectedUserStoriesContext();
  const selectedProject = typeof window !== 'undefined' ? 
    localStorage.getItem("currentProjectId") : null;
  const [restoreTrigger, setRestoreTrigger] = useState(false);
  const shouldRestoreAssignments = useRef(false);
  const previousAssignmentsRef = useRef<Record<string, string>>({});
  const selectedEpics = epics.filter(epic => selectedEpicIds.includes(epic.uuid));
  const epicRefHistory = useRef<Map<string, string>>(new Map());
  const userStoryContext = useUserStories();
  const [groupingVersion, setGroupingVersion] = useState(0);
  const { assignmentMap, saveAssignment, getAssignment } = useAssignmentContext();


  const isEqualJSON = useCallback((a: any, b: any): boolean => {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    setGroupingVersion(prev => prev + 1);
  }, [userStories]);

  const {
    generate,
    isLoading,
    generatedOutput,
    error
  } = useGenerateUserStories();

  useEffect(() => {
    if (generatedOutput && generatedOutput?.content && userStories.length === 0) {
      const parsed = parseUserStoriesFromAPI(generatedOutput);
      setUserStories(parsed);
    }
  }, [generatedOutput]);

  useEffect(() => {
    requirements.forEach(req => {
      if (req.epicRef) {
        epicRefHistory.current.set(req.uuid, req.epicRef);
      }
    });
  }, [requirements]);
  
  const groupEpicsForAPI = useCallback((epics: Epic[]) => ({
    content: epics.map((epic) => ({
      uuid: epic.uuid || '',
      id: epic.idTitle || epic.id,
      title: epic.title,
      description: epic.description,
      related_requirements: (epic.relatedRequirements || []).map(req => ({
        id: req.idTitle|| '',
        description: req.description || ''
      }))
    }))
  }), []);

  const handleImportRequirements = async () => {
    try {
      const importedReqs = await getProjectRequirements(selectedProject!);
      setRequirements(importedReqs);
      setSelectedIds(importedReqs.map(r => r.uuid));
    } catch (err) {
      console.error("Error while importing requirements");
    }
  };

    
  useEffect(() => {
    if (epics.length === 0 || requirements.length === 0) return;
  
    const selectedIdsSet = new Set(selectedIds);
  
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
          return { ...req, epicRef: matchedEpic.idTitle };
        }
      }
  
      if (
        selectedIdsSet.has(req.uuid) &&
        !req.epicRef &&
        epicRefHistory.current.has(req.uuid)
      ) {
        return { ...req, epicRef: epicRefHistory.current.get(req.uuid) };
      }
  
      return req;
    });
  
    if (!isEqualJSON(updatedReqs, requirements)) {
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

    
  const handleGenerate = useCallback(() => {
    setUserStories([]);
    setSelectedUserStoriesIds([]);
    const grouped = groupEpicsForAPI(selectedEpics);
    if (selectedEpics.length === 0) return;
    generate(grouped);
  }, [selectedEpics, groupEpicsForAPI, generate, setUserStories, setSelectedUserStoriesIds]);
  

  const handleUpdateStory = useCallback((updated: UserStory) => {
    setUserStories(prev => {
      const withoutOld = prev.filter(s => s.uuid !== updated.uuid);
      return [...withoutOld, updated];
    });
  }, [setUserStories]);

  const handleSelectAll = useCallback(() => {
    const allUserStoryIds = userStories.map(story => story.uuid);
    setSelectedUserStoriesIds(allUserStoryIds);
  }, [userStories, setSelectedUserStoriesIds]);
  
  const handleClear = useCallback(() => {
    setUserStories([]);
    setSelectedUserStoriesIds([]);
  }, [setUserStories, setSelectedUserStoriesIds]);

  const handleSave = async () => {
    try {
      if (requirements && selectedIds) {
        await saveRequirements(requirements, selectedIds, selectedProject!);
      }
  
      if (epics && selectedEpicIds) {
        const selectedEpicsData = epics.filter(e => selectedEpicIds.includes(e.uuid));
        const cleanedEpics = selectedEpicsData.map(e => ({
          uuid: e.uuid,
          idTitle: e.idTitle,
          title: e.title,
          description: e.description,
          relatedRequirements: e.relatedRequirements.map(r => ({
            uuid: r.uuid,
            idTitle: r.idTitle,
            title: r.title,
            description: r.description,
          }))
        }));
        await postEpics(cleanedEpics, selectedProject!);
      }
  
      const selected = userStories.filter(
        story =>
          selectedUserStoriesIds.includes(story.uuid) &&
          story.assigned_epic !== 'UNASSIGNED'
      );
  
      const cleaned = selected.map(s => ({
        uuid: s.uuid,
        idTitle: s.idTitle,
        title: s.title,
        description: s.description,
        priority: s.priority,
        points: s.points,
        acceptanceCriteria: s.acceptanceCriteria,
        assigned_epic: s.assigned_epic
      }));
  
      await postUserStories(cleaned, selectedProject!, (userStories: UserStory[]) => {
              userStoryContext.setUserStoriesForProject(selectedProject!, userStories);
      });  
    } catch (err) {
    }
  };
  
  const handleImportUserStories = async () => {
    try{
      const userStoriesResponse = await getProjectUserStories(selectedProject!);
      const parsed = parseUserStoriesFromDB(userStoriesResponse);
      setUserStories(parsed);
      userStoryContext.setUserStoriesForProject(selectedProject!, userStoriesResponse);
  } catch (err) {
    console.error("Error while fetching user stories:", err);
  }
  }

  const handleImportEpics = async () => {
    try {
      const importedReqs = await getProjectRequirements(selectedProject!);
      const importedEpics = await getProjectEpics(selectedProject!);
      
      importedReqs.forEach(req => {
        if (req.epicRef) {
          epicRefHistory.current.set(req.uuid, req.epicRef);
        }
      });
      
      const reqMap = new Map();
      importedReqs.forEach(req => {
        reqMap.set(req.uuid, req);
      });
      
      const epicsWithReqs = importedEpics.map(epic => {
        const relatedReqs = epic.relatedRequirements
          .filter(r => r.uuid && reqMap.has(r.uuid))
          .map(r => {
            const fullReq = reqMap.get(r.uuid);
            return {
              uuid: fullReq.uuid,
              idTitle: fullReq.idTitle,
              title: fullReq.title,
              description: fullReq.description
            };
          });
        
        return {
          ...epic,
          relatedRequirements: relatedReqs
        };
      });
      
      const updatedReqs = importedReqs.map(req => {
        for (const epic of epicsWithReqs) {
          if (epic.relatedRequirements.some(r => r.uuid === req.uuid)) {
            epicRefHistory.current.set(req.uuid, epic.idTitle);
            return {
              ...req,
              epicRef: epic.idTitle
            };
          }
        }
        return req;
      });
      
      await new Promise<void>(resolve => {
        setRequirements(updatedReqs);
        setSelectedIds(updatedReqs.map(r => r.uuid));
        resolve();
      });
      
      await new Promise<void>(resolve => {
        setTimeout(() => {
          setEpics(epicsWithReqs);
          setSelectedEpicIds(epicsWithReqs.map(e => e.uuid));
          resolve();
        }, 50);
      });
      
      shouldRestoreAssignments.current = true;
    } catch (err) {
      console.error("Error while importing epics and requirements:", err);
    }
  };

  useEffect(() => {
    if (epics.length > 0 && requirements.length > 0) {
      const selectedIdsSet = new Set(selectedIds);
      
      const reqMap = new Map();
      requirements.forEach(req => {
        reqMap.set(req.uuid, req);
      });
      
      const updatedEpics = epics.map(epic => {
        const shouldBeRelated = requirements.filter(req => 
          selectedIdsSet.has(req.uuid) && 
          req.epicRef === epic.idTitle && 
          !epic.relatedRequirements.some(r => r.uuid === req.uuid)
        );
        
        if (shouldBeRelated.length > 0) {
          return {
            ...epic,
            relatedRequirements: [
              ...epic.relatedRequirements,
              ...shouldBeRelated.map(req => ({
                uuid: req.uuid,
                idTitle: req.idTitle,
                title: req.title,
                description: req.description
              }))
            ]
          };
        }
        
        return epic;
      });
      
      if (JSON.stringify(updatedEpics) !== JSON.stringify(epics)) {
        setEpics(updatedEpics);
      }
    }
  }, [epics, requirements, selectedIds]);

  
  useEffect(() => {
    if (userStories.length === 0 || epics.length === 0) return;
    
    const epicIdTitlesToCheck = epics
      .filter(epic => selectedEpicIds.includes(epic.uuid))
      .map(epic => epic.idTitle);
    
    const unassignedStories = userStories.filter(story => 
      story.assigned_epic === 'UNASSIGNED' && 
      getAssignment(story.uuid)
    );

    const restorableStories = unassignedStories.filter(story => {
      const previousEpic = getAssignment(story.uuid);
      return previousEpic && epicIdTitlesToCheck.includes(previousEpic);
    });
    
    if (restorableStories.length > 0) {
      setRestoreTrigger(prev => !prev);
    }
  }, [selectedEpicIds.join(','), epics.length, userStories.length]);

  
  useEffect(() => {
    if (userStories.length === 0 || epics.length === 0) return;
    
    const selectedEpicIdTitleMap = new Map();
    epics.forEach(epic => {
      if (selectedEpicIds.includes(epic.uuid)) {
        selectedEpicIdTitleMap.set(epic.idTitle, epic.uuid);
      }
    });
    
    let assignmentsToStore: Record<string, string> = {};
    let hasNewAssignments = false;
    
    userStories.forEach(story => {
      if (story.assigned_epic && story.assigned_epic !== 'UNASSIGNED') {
        const currentAssignment = getAssignment(story.uuid);
        
        if (currentAssignment !== story.assigned_epic) {
          assignmentsToStore[story.uuid] = story.assigned_epic;
          hasNewAssignments = true;
        }
      }
    });
    
    if (hasNewAssignments) {
      Object.entries(assignmentsToStore).forEach(([uuid, epic]) => {
        saveAssignment(uuid, epic);
      });
    }
  
    const updatedStories = userStories.map(story => {
      const currentEpic = story.assigned_epic;
      const previousEpic = getAssignment(story.uuid);
      
      if (
        currentEpic && 
        currentEpic !== 'UNASSIGNED' && 
        !selectedEpicIdTitleMap.has(currentEpic)
      ) {
        return { ...story, assigned_epic: 'UNASSIGNED' };
      }
      
      if (
        currentEpic === 'UNASSIGNED' && 
        previousEpic
      ) {
        if (selectedEpicIdTitleMap.has(previousEpic)) {
          return { ...story, assigned_epic: previousEpic };
        } 
      }
      
      return story;
    });
  
    const changed = updatedStories.some(
      (story, i) => story.assigned_epic !== userStories[i].assigned_epic
    );
  
    if (changed) {
      setUserStories(updatedStories);
    }
    
  }, [selectedEpicIds.join(','), epics.length, userStories.length, restoreTrigger]);

  

  const handleDeleteStory = useCallback((storyUuid: string) => {
    setUserStories(prev => {
      const updated = prev.filter(story => story.uuid !== storyUuid);
      return reorderUserStoryIds(updated);
    });
    setSelectedUserStoriesIds(prev => prev.filter(uuid => uuid !== storyUuid));
  }, [setUserStories, setSelectedUserStoriesIds]);
  
  
  const groupedByEpic = useMemo(() => 
    groupUserStoriesByEpic([...userStories]), 
    [userStories, groupingVersion]
  );
  
  const allEpicOptions = useMemo(() => 
    epics.map(e => ({ uuid: e.uuid, id: e.idTitle, title: e.title })),
    [epics]
  );

  return {
    epicDescription,
    setEpicDescription,
    editMode,
    setEditMode,
    handleGenerate,
    handleUpdateStory,
    handleSelectAll,
    handleSave,
    handleImportEpics,
    handleDeleteStory,
    handleClear,
    handleImportRequirements,
    handleImportUserStories,
    selectedEpics,
    selectedEpicIds,
    userStories,
    groupedByEpic,
    groupingVersion,
    error,
    isLoading,
    allEpicOptions
  };
};
