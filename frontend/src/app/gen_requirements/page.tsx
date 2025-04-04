'use client';

import RequirementCard from './components/requirementcard';
import { Requirement } from '@/types/requirement';
import { useState, useEffect } from 'react';
import GeneratorView from '@/components/generatorview';
import { useGenerateRequirements } from '@/hooks/useGenerateRequirements';
import { parseRequirementsFromAPI } from '@/utils/parseRequirementsFromApi';

export default function RequirementsPage() {
  const [projectDescription, setProjectDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const {
    generate,
    isLoading,
    generatedOutput,
    error
  } = useGenerateRequirements();

  useEffect(() => {
    if (generatedOutput && generatedOutput.content) {
      const parsed = parseRequirementsFromAPI(generatedOutput);
      setRequirements(parsed);
    }
  }, [generatedOutput]);

  const handleGenerate = () => {
    if (projectDescription.trim() === "") return;
    generate(projectDescription);
  };

  return (
    <GeneratorView
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
          onUpdate={(updated) =>
            setRequirements((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            )
          }
          editMode={editMode}
        />
      )}
    />
  );
}