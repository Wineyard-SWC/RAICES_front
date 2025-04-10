'use client';

import GeneratorView from '@/components/generatorview';
import EpicCard from './components/epiccard';
import { Requirement } from '@/types/requirement';
import { useState, useEffect } from 'react';
import { Epic } from '@/types/epic';
import { useGenerateEpics } from '@/hooks/useGenerateEpics';
import { parseEpicsFromAPI } from '@/utils/parseEpicsFromAPI';
import { useEpicContext } from '@/contexts/epiccontext';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { projectInputStyles as input } from '../gen_requirements/styles/projectinput.module';
import { useSelectedRequirementContext } from '@/contexts/selectedrequirements';
import { useSelectedEpicsContext } from '@/contexts/selectedepics';
import RequirementCard from '../gen_requirements/components/requirementcard';
import LoadingScreen from '@/components/loading';


export default function GenerateEpicsPage() {
  const [reqDescription, setReqDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const {epics, setEpics} = useEpicContext();
  const { requirements } = useRequirementContext();
  const { selectedIds } = useSelectedRequirementContext();
  const {selectedEpicIds, setSelectedEpicIds} = useSelectedEpicsContext();

  const selectedRequirements = requirements.filter(req => selectedIds.includes(req.id));

  const {
    generate,
    isLoading,
    generatedOutput,
    error
  } = useGenerateEpics();

  useEffect(() => {

    if (generatedOutput && generatedOutput?.content && epics.length === 0) {
      const parsed = parseEpicsFromAPI(generatedOutput);
      setEpics(parsed); 
    }
  }, [generatedOutput]);

  const handleGenerate = () => {
    const grouped = groupRequirementsForAPI(selectedRequirements);

    if (selectedRequirements.length === 0) return;
    
    generate(grouped);
  };

  const handleUpdateEpic = (updated: Epic) => {
    setEpics((prev) =>
      prev.map((epic) => (epic.id === updated.id ? updated : epic))
    );
  }

  const toggleSelectEpic = (reqId: string) => {
    setSelectedEpicIds(prev =>
      prev.includes(reqId) ? prev.filter(id => id !== reqId) : [...prev, reqId]
    );
  };

  const groupRequirementsForAPI = (reqs: Requirement[]) => {
    const mapClean = (r: Requirement) => ({
      id: r.idTitle,
      title: r.title,
      description: r.description,
      category: r.category,
      priority: r.priority.toLowerCase() === 'high' ? 'Alta' :
                r.priority.toLowerCase() === 'medium' ? 'Media' :
                r.priority.toLowerCase() === 'low' ? 'Baja' : 'Media',
    });
  
    return {
      funcionales: reqs.filter(r => r.category === 'Funcional').map(mapClean),
      no_funcionales: reqs.filter(r => r.category === 'No Funcional').map(mapClean),
    };
  };

  const handleSelectAll = () => {
    const allEpicsIds = epics.map(epic => epic.id);
    
    setSelectedEpicIds(allEpicsIds);
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="epics"/>
    

      <GeneratorView
        inputTitle="📄 Requirements Input"
        inputLabel="List your requirements"
        inputValue={reqDescription}
        onInputChange={setReqDescription}
        onGenerate={handleGenerate}
        onClear={() => {
          setReqDescription('');
          setEpics([]);
        }}
        generatedTitle="Generated Epics"
        isEditMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        isLoading={isLoading}
        error={error}
        items={epics}
        renderItem={(epic) => (
          <EpicCard
            key={epic.id}
            {...epic}
            isSelected={selectedEpicIds.includes(epic.id)}
            onToggleSelect={() => toggleSelectEpic(epic.id)}
            editMode={editMode}
            onUpdate={handleUpdateEpic}
          />
        )}
        renderLeftContent={() => (

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <label className={input.label}>Project's Requirements</label>

            {selectedRequirements.map((req) => (
              <RequirementCard
                key={req.id}
                {...req}
                isSelected = {true}
                idTitle={req.id}
                editMode={false}
                onUpdate={() => {}} 
              />
            ))}
          </div>
        )}
        onSelectAll={handleSelectAll}
      />
    </>
  );
}
