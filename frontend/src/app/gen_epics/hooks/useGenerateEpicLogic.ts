'use client';

import { useEffect } from 'react';
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


export const useGenerateEpicsLogic = (
  reqDescription: string,
  setReqDescription: (v: string) => void
) => {
  const { epics, setEpics } = useEpicContext();
  const { requirements, setRequirements } = useRequirementContext();
  const { selectedIds, setSelectedIds } = useSelectedRequirementContext();
  const { selectedEpicIds, setSelectedEpicIds } = useSelectedEpicsContext();
  const selectedProject = localStorage.getItem("currentProjectId");

  const {
    generate,
    isLoading,
    generatedOutput,
    error,
  } = useGenerateEpics();

  const selectedRequirements = requirements.filter(req => selectedIds.includes(req.uuid));

  useEffect(() => {
    if (epics.length === 0 || requirements.length === 0) return;

    const reqMap = new Map(requirements.map(req => [req.uuid, req]));

    const updatedEpics = epics.map(epic => ({
      ...epic,
      relatedRequirements: epic.relatedRequirements
        .filter(req => req.uuid && reqMap.has(req.uuid))
        .map(req => {
          const updated = reqMap.get(req.uuid)!;
          return { ...req, ...updated };
        })
    }));

    setEpics(updatedEpics);
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

  const handleGenerate = () => {
    setSelectedEpicIds([]);
    setEpics([]);
    const grouped = groupRequirementsForAPI(selectedRequirements);
    generate(grouped);
  };

  const handleUpdateEpic = (updated: Epic) => {
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
  };

  const handleSave = async () => {
    try {
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
    } catch (err) {
      console.error('Error while saving the epics:');
    }
  };

  const handleImportRequirements = async () => {
    try {
      const importedReqs = await getProjectRequirements(selectedProject!);
      setRequirements(importedReqs);
      setSelectedIds(importedReqs.map(r => r.uuid));
    } catch (err) {
      console.error("Error while importing requirements");
    }
  };

  const handleSelectAll = () => {
    const allEpicsIds = epics.map(epic => epic.uuid);
    setSelectedEpicIds(allEpicsIds);
  };

  const handleDeleteEpic = (epicIdToDelete: string) => {
    setEpics(prev => reorderEpicIds(prev.filter(e => e.uuid !== epicIdToDelete)));
    setSelectedEpicIds(prev => prev.filter(uuid => uuid !== epicIdToDelete));
  };


  const handleClear = () => {
    setRequirements([]);
    setEpics([]);
    setSelectedEpicIds([]);
    setSelectedIds([]);
  }

  const toggleSelectEpic = (epicUuid: string) => {
    setSelectedEpicIds(prev =>
      prev.includes(epicUuid) ? prev.filter(uuid => uuid !== epicUuid) : [...prev, epicUuid]
    );
  };

  const groupRequirementsForAPI = (reqs: Requirement[]) => {
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
  };

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
    setSelectedEpicIds
  };
};
