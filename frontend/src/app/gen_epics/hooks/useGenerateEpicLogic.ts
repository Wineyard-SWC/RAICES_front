'use client';

import { useEffect,useRef, useMemo, useCallback } from 'react';
import { Requirement } from '@/types/requirement';
import { Epic } from '@/types/epic';
import { useGenerateEpics } from '@/hooks/useGenerateEpics';
import { parseEpicsFromAPI } from '@/utils/parseEpicsFromAPI';
import { useEpicContext } from '@/contexts/epiccontext';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { useSelectedRequirementContext } from '@/contexts/selectedrequirements';
import { useSelectedEpicsContext } from '@/contexts/selectedepics';
import { postEpics } from '@/utils/postEpics';
import { getProjectRequirements } from '@/utils/getProjectRequirements';
import { reorderEpicIds } from '../utils/reorderEpicIds';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';
import { useUserStoryContext } from '@/contexts/userstorycontext';
import saveRequirements from '@/app/gen_requirements/utils/handleSave';
import { useAssignmentContext } from '@/contexts/userstoriesepicsrelationshipcontext';



export const useGenerateEpicsLogic = (
  reqDescription: string,
  setReqDescription: (v: string) => void
) => {
  const { epics, setEpics } = useEpicContext();
  const { requirements, setRequirements } = useRequirementContext();
  const { selectedIds, setSelectedIds } = useSelectedRequirementContext();
  const { selectedEpicIds, setSelectedEpicIds } = useSelectedEpicsContext();
  const { setSelectedUserStoriesIds} = useSelectedUserStoriesContext();
  const { userStories,setUserStories} = useUserStoryContext();
  const selectedProject = typeof window !== 'undefined' ? 
    localStorage.getItem("currentProjectId") : null;
  const epicRefHistory = useRef<Map<string, string>>(new Map());
  const { hasStoriesForEpic} = useAssignmentContext();

  const checkIfEpicHasAssignedStories = useCallback((epicIdTitle: string) => {
    return hasStoriesForEpic(epicIdTitle);
  }, [hasStoriesForEpic]);
  
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
    error,
  } = useGenerateEpics();

  const selectedRequirements = requirements.filter(req => selectedIds.includes(req.uuid));

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
  
  
  useEffect(() => {
    requirements.forEach(req => {
      if (req.epicRef) {
        epicRefHistory.current.set(req.uuid, req.epicRef);
      }
    });
  }, [requirements]);

  useEffect(() => {
    if (epics.length > 0 && requirements.length > 0) {
      const allRelatedIds = new Set<string>();
      epics.forEach(epic =>
        epic.relatedRequirements.forEach(req => req.uuid && allRelatedIds.add(req.uuid))
      );
      setSelectedIds(prev => Array.from(new Set([...prev, ...Array.from(allRelatedIds)])));
    }
  }, [epics, requirements]);

  useEffect(() => {
    if (generatedOutput?.content && epics.length === 0) {
      const parsed = parseEpicsFromAPI(generatedOutput, selectedRequirements);
      setEpics(parsed);
    }
  }, [generatedOutput]);

  const handleGenerate = useCallback(() => {
    setSelectedEpicIds([]);
    setEpics([]);
    
    if (userStories) {
      setUserStories([]);
      setSelectedUserStoriesIds([]);
    }
    
    const grouped = groupRequirementsForAPI(selectedRequirements);
    generate(grouped);
  }, [
    selectedRequirements, 
    generate, 
    setSelectedEpicIds, 
    setEpics, 
    setUserStories, 
    setSelectedUserStoriesIds
  ]);

  const resetUserStories = useCallback(() => {
    if (userStories) {
      setUserStories([]);
      setSelectedUserStoriesIds([]);
    }
  }, [userStories, setUserStories, setSelectedUserStoriesIds]);

  const handleUpdateEpic = useCallback((updated: Epic) => {
    const relatedUuids = updated.relatedRequirements.map(req => req.uuid);

    setSelectedIds(prev => Array.from(new Set([...prev, ...relatedUuids])));

    setEpics(prev => prev.map(epic => (epic.uuid === updated.uuid ? updated : epic)));

    setRequirements(prev => {
      const updatedMap = new Map(prev.map(r => [r.uuid, r]));
      updated.relatedRequirements.forEach(req => {
        const existing = updatedMap.get(req.uuid);
        if (existing) {
          updatedMap.set(req.uuid, { ...existing, ...req });
        }
      });
      return Array.from(updatedMap.values());
    });
  }, [setSelectedIds, setEpics, setRequirements]);

  const handleSave = async () => {
    try {

      if (requirements && selectedIds && selectedIds.length > 0) {
        await saveRequirements(requirements, selectedIds, selectedProject!);
      }

      if (epics && selectedEpicIds && selectedEpicIds.length > 0) {
        const selected = epics.filter(e => selectedEpicIds.includes(e.uuid));
        const cleaned = selected.map(e => ({
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
        await postEpics(cleaned, selectedProject!);
      }
    } catch (err) {
      console.error('Error while saving the epics:');
    }
  };

  const handleImportRequirements = async () => {
    try {
      const importedReqs = await getProjectRequirements(selectedProject!);
      
      if (epics.length > 0) {
        const reqMap = new Map(importedReqs.map(req => [req.uuid, req]));
        
        const updatedEpics = epics.map(epic => {
          const existingReqs = epic.relatedRequirements
            .filter(req => req.uuid && reqMap.has(req.uuid))
            .map(req => {
              const updated = reqMap.get(req.uuid)!;
              return { 
                uuid: updated.uuid,
                idTitle: updated.idTitle,
                title: updated.title,
                description: updated.description
              };
            });
        
          const newReqs = importedReqs
            .filter(req => 
              req.epicRef === epic.idTitle && 
              !existingReqs.some(er => er.uuid === req.uuid)
            )
            .map(req => ({
              uuid: req.uuid,
              idTitle: req.idTitle,
              title: req.title,
              description: req.description
            }));
          
          return {
            ...epic,
            relatedRequirements: [...existingReqs, ...newReqs]
          };
        });
        
        const updatedReqs = [...importedReqs];
        
        updatedEpics.forEach(epic => {
          epic.relatedRequirements.forEach(relatedReq => {
            const reqIndex = updatedReqs.findIndex(r => r.uuid === relatedReq.uuid);
            if (reqIndex >= 0 && (!updatedReqs[reqIndex].epicRef || updatedReqs[reqIndex].epicRef !== epic.idTitle)) {
              updatedReqs[reqIndex] = {
                ...updatedReqs[reqIndex],
                epicRef: epic.idTitle
              };
            }
          });
        });
        
        setRequirements(updatedReqs);
        setSelectedIds(updatedReqs.map(r => r.uuid));
        setEpics(updatedEpics);
      } else {
        setRequirements(importedReqs);
        setSelectedIds(importedReqs.map(r => r.uuid));
      }
    } catch (err) {
      console.error("Error while importing requirements", err);
    }
  };
  
  const handleSelectAll = useCallback(() => {
    const allEpicsIds = epics.map(epic => epic.uuid);
    setSelectedEpicIds(allEpicsIds);
  }, [epics, setSelectedEpicIds]);

  const handleDeleteEpic = useCallback((epicIdToDelete: string) => {
    setEpics(prev => reorderEpicIds(prev.filter(e => e.uuid !== epicIdToDelete)));
    setSelectedEpicIds(prev => prev.filter(uuid => uuid !== epicIdToDelete));
  }, [setEpics, setSelectedEpicIds]);

  const handleClear = useCallback(() => {
    setEpics([]);
    setSelectedEpicIds([]);
    resetUserStories();
  }, [setEpics, setSelectedEpicIds, resetUserStories]);


  const toggleSelectEpic = useCallback((epicUuid: string) => {
    const isCurrentlySelected = selectedEpicIds.includes(epicUuid);
    
    setSelectedEpicIds(prev =>
      isCurrentlySelected ? prev.filter(uuid => uuid !== epicUuid) : [...prev, epicUuid]
    );
  }, [selectedEpicIds, epics, checkIfEpicHasAssignedStories, setSelectedEpicIds]);

  const groupRequirementsForAPI = useCallback((reqs: Requirement[]) => {
    const mapClean = (r: Requirement) => {
      const category = r.category || (r.idTitle?.includes('-NF-') ? 'No Funcional' : 'Funcional');
      return {
        id: r.idTitle,
        title: r.title,
        description: r.description,
        category,
        priority:
          r.priority.toLowerCase() === 'high' ? 'Alta' :
          r.priority.toLowerCase() === 'medium' ? 'Media' :
          'Baja',
      };
    };

    const processedReqs = reqs.map(mapClean);

    return {
      funcionales: processedReqs.filter(r => r.category === 'Funcional'),
      no_funcionales: processedReqs.filter(r => r.category === 'No Funcional'),
    };
  }, []);

  return {
    epics,
    selectedIds,
    selectedEpicIds,
    requirements,
    selectedRequirements,
    isLoading,
    error,
    handleGenerate,
    handleUpdateEpic,
    handleSave,
    handleSelectAll,
    handleClear,
    handleDeleteEpic,
    toggleSelectEpic,
    handleImportRequirements,
    setEpics,
    setRequirements,
    setSelectedIds,
    setSelectedEpicIds,
    selectedProject
  };
};
