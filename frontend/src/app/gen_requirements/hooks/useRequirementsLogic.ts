import { useEffect } from 'react';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { useSelectedRequirementContext } from '@/contexts/selectedrequirements';
import { useEpicContext } from '@/contexts/epiccontext';
import { Requirement } from '@/types/requirement';
import { useGenerateRequirements } from '@/hooks/useGenerateRequirements';
import { parseRequirementsFromAPI } from '@/utils/parseRequirementsFromApi';

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
  const selectedProject = localStorage.getItem("currentProjectId");

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
        console.error("Error parsing generated requirements", err);
      }
    }
  }, [generatedOutput, setRequirements]);

  useEffect(() => {
    if (epics.length === 0 || requirements.length === 0) return;

    const reqMap = new Map<string, Requirement>();
    requirements.forEach(req => {
      reqMap.set(req.uuid, req);
    });

    const updatedEpics = epics.map(epic => {
      const currentRelated = epic.relatedRequirements.filter(req =>
        selectedIds.includes(req.uuid)
      );

      const newRelated = requirements
        .filter(req => selectedIds.includes(req.uuid) && req.epicRef === epic.idTitle)
        .filter(req => !currentRelated.some(r => r.uuid === req.uuid));

      const fullList = [...currentRelated, ...newRelated].map(req => ({
        uuid: req.uuid,
        idTitle: req.idTitle,
        title: req.title,
        description: req.description,
      }));

      return {
        ...epic,
        relatedRequirements: fullList,
      };
    });

    setEpics(updatedEpics);
  }, [selectedIds, requirements, setEpics]);

  const handleGenerate = () => {
    setSelectedIds([]);
    setRequirements([]);
    if (projectDescription.trim() === "") return;
    generate(projectDescription);
  };

  const handleClear = () => {
    setProjectDescription("");
    setRequirements([]);
    setSelectedIds([]);
  };

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
