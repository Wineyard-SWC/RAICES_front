'use client';

import RequirementCard from './components/requirementcard';
import { Requirement } from '@/types/requirement';
import { useState, useEffect } from 'react';
import GeneratorView from '@/components/generatorview';
import { useGenerateRequirements } from '@/hooks/useGenerateRequirements';
import { parseRequirementsFromAPI } from '@/utils/parseRequirementsFromApi';
import { projectInputStyles as input } from './styles/projectinput.module';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { useProjectContext } from '@/contexts/projectcontext';
import { useSelectedRequirementContext } from '@/contexts/selectedrequirements';
import LoadingScreen from '@/components/loading';
import Navbar from '@/components/navbar';
import { postRequirements } from '@/utils/postRequirements';

export default function RequirementsPage() {
  const { projectDescription, setProjectDescription } = useProjectContext();
  const [ editMode, setEditMode ] = useState(false);
  const { requirements, setRequirements } = useRequirementContext();
  const { selectedIds, setSelectedIds } = useSelectedRequirementContext();
  const selectedProject = localStorage.getItem("currentProjectId") 
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
      } 
      catch (err) {
      }
    }
  }, [generatedOutput, setRequirements]);

  const handleGenerate = () => {
    if (projectDescription.trim() === "") return;
    generate(projectDescription);
  };

  const toggleSelectRequirement = (reqId: string) => {
    setSelectedIds(prev =>
      prev.includes(reqId) ? prev.filter(id => id !== reqId) : [...prev, reqId]
    );
  };

  const handleSelectAll = () => {
    const allRequirementsIds = requirements.map(req => req.id);
    
    setSelectedIds(allRequirementsIds);
  };


  const handleSave = async () => {
    try {
      const selectedRequirements = requirements.filter(req => selectedIds.includes(req.id));


      const cleaned = requirements.map(r => ({
        idTitle: r.idTitle,
        title: r.title,
        description: r.description,
        priority: r.priority,
        epicRef: "", 
        projectRef: selectedProject
      }));
      await postRequirements(cleaned, selectedProject!);
      alert('Requerimientos guardados con éxito!');
    } catch (error) {
      console.error('Error al guardar requerimientos:', error);
    }
  };
  

  return (
    
    <>
      <LoadingScreen isLoading={isLoading} generationType="requirements" />
    
      <Navbar projectSelected={true} />

      <GeneratorView
        showInput={true}
        inputTitle="📱 Project Input"
        inputLabel="Project's Description"
        inputValue={projectDescription}
        onInputChange={setProjectDescription}
        onGenerate={handleGenerate}
        onClear={() => {
          setProjectDescription("");
          setRequirements([]);
        }}
        generatedTitle="Generated Requirements"
        isEditMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        items={requirements}
        renderItem={(req) => (
          <RequirementCard
            key={req.id}
            {...req}
            idTitle={`${req.idTitle}`}
            isSelected={selectedIds.includes(req.id)}
            onToggleSelect={() => toggleSelectRequirement(req.id)}
            onUpdate={(updated) =>
              setRequirements((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
              )
            }
            editMode={editMode}
            onDelete={(deletedId) =>
              setRequirements((prev) => prev.filter((r) => r.id !== deletedId))
            } 
          />
        )}
        onSelectAll={handleSelectAll}
        isLoading={isLoading}
        error={error}
        onSave={handleSave}
      />
    </>
  );
}