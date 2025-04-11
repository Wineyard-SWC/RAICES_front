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
import Navbar from '@/components/Navbar';
import { postEpics } from '@/utils/postEpics';
import { getProjectRequirements } from '@/utils/getProjectRequirements';

export default function GenerateEpicsPage() {
  const [reqDescription, setReqDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const {epics, setEpics} = useEpicContext();
  const { requirements, setRequirements } = useRequirementContext();
  const { selectedIds, setSelectedIds } = useSelectedRequirementContext();
  const {selectedEpicIds, setSelectedEpicIds} = useSelectedEpicsContext();
  const selectedProject = localStorage.getItem("currentProjectId")
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

    const mapClean = (r: Requirement) => {
      const category = r.category || (r.idTitle?.includes('-NF-') ? 'No Funcional' : 'Funcional');
      
      return {
        id: r.idTitle,
        title: r.title,
        description: r.description,
        category: category,
        priority: r.priority.toLowerCase() === 'high' ? 'Alta' :
                  r.priority.toLowerCase() === 'medium' ? 'Media' :
                  r.priority.toLowerCase() === 'low' ? 'Baja' : 'Media',        
      };
    }; 
    const processedReqs = reqs.map(mapClean);


    return {
      funcionales: processedReqs.filter(r => r.category === 'Funcional'),
      no_funcionales: processedReqs.filter(r => r.category === 'No Funcional'),
    };
  };

  const handleSelectAll = () => {
    const allEpicsIds = epics.map(epic => epic.id);
    
    setSelectedEpicIds(allEpicsIds);
  };


  const handleSave = async () => {
    try {
      const selected = epics.filter(e => selectedEpicIds.includes(e.id));
  
      const cleaned = selected.map(e => ({
        idTitle: e.idTitle,
        title: e.title,
        description: e.description,
        relatedRequirements: e.relatedRequirements.map(r => ({
          idTitle: r.idTitle,
          title: r.title,
          description: r.description
        }))
      }));
  
      await postEpics(cleaned, selectedProject!);
      alert('Épicas guardadas con éxito!');
    } catch (err) {
      console.error('Error al guardar épicas:', err);
    }
  };

  const handleImportRequirements = async () => {
    try {
      const importedReqs = await getProjectRequirements(selectedProject!);
      setRequirements(importedReqs);
      const importedIds = importedReqs.map((r) => r.id);
      setSelectedIds(importedIds);      
      alert("Requerimientos importados");
    } catch (err) {
      console.error("Error importando requerimientos", err);
    }
  };







  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="epics"/>
    
      <Navbar projectSelected={true} />

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
            onDelete={(id) => {
              setEpics((prev) => prev.filter((epic) => epic.id !== id));
              setSelectedEpicIds((prev) => prev.filter((epicId) => epicId !== id));
            }}
          />
        )}
        renderLeftContent={() => (
          <div>
            <div className="flex items-baseline  justify-between">
            <label className={input.label}>Selected Requirements</label>
            <button 
              className="text-[#4A2B4A] text-sm font-medium hover:underline"
              onClick={handleImportRequirements}
            >
              Import from project's requirements
            </button>
            </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          
            {selectedRequirements.map((req) => (
              <RequirementCard
                key={req.id}
                {...req}
                isSelected = {true}
                idTitle={req.idTitle}
                editMode={false}
                onUpdate={() => {}} 
                onDelete={() => {}}
              />
            ))}
          </div>
          </div>
          
        )}
        onSelectAll={handleSelectAll}
        onSave={handleSave}
      />
    </>
  );
}
