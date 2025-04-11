'use client';

import EpicUserStoryGroup from './components/epicwithuserstoriescard';
import GeneratorView from '@/components/generatorview';
import { epicInputStyles as input } from "./styles/epicinput.module";
import { projectInputStyles as inputproject } from '../gen_requirements/styles/projectinput.module';
import { useState, useEffect } from 'react';
import { UserStory } from '@/types/userstory';
import { useGenerateUserStories } from '@/hooks/useGenerateUserStories'; 
import { parseUserStoriesFromAPI } from '@/utils/parseUserStoriesFromApi'; 
import { groupUserStoriesByEpic } from '@/utils/groupUserStoriesByEpic'; 
import { useEpicContext } from '@/contexts/epiccontext';
import EpicCard from '../gen_epics/components/epiccard';
import { useUserStoryContext } from '@/contexts/userstorycontext';
import { useSelectedEpicsContext } from '@/contexts/selectedepics';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';
import { Epic } from '@/types/epic';
import LoadingScreen from '@/components/loading';
import Navbar from '@/components/navbar';
import { postUserStories } from '@/utils/postUserStories';
import { getProjectEpics } from '@/utils/getProjectEpics';
import { getProjectRequirements } from '@/utils/getProjectRequirements';

export default function GenerateUserStoriesPage() {
  const [epicDescription, setEpicDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { userStories, setUserStories } = useUserStoryContext();
  const { epics,setEpics } = useEpicContext();
  const {selectedEpicIds,setSelectedEpicIds } = useSelectedEpicsContext();
  const { selectedUserStoriesIds, setSelectedUserStoriesIds} = useSelectedUserStoriesContext();
  const selectedProject = localStorage.getItem("currentProjectId")



  const selectedEpics = epics.filter(epic => selectedEpicIds.includes(epic.id));

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

  const handleGenerate = () => {
    const grouped = groupEpicsForAPI(selectedEpics);
    if (selectedEpics.length === 0) return;
    generate(grouped);
  };

  const groupEpicsForAPI = (epics: Epic[]) => {
    const mapRequirement = (req: any) => ({
      id: req.idTitle || req.id || '',
      description: req.description || ''
    });
  
    return {
      content: epics.map((epic) => ({
        id: epic.idTitle || epic.id,
        title: epic.title,
        description: epic.description,
        related_requirements: (epic.relatedRequirements || []).map(mapRequirement)
      }))
    };
  };
  
  const groupedByEpic = groupUserStoriesByEpic(userStories ?? []);
  const allEpicIds = Object.keys(groupedByEpic);
  const allEpicOptions = epics.map(e => ({
    id: e.idTitle,
    title: e.title
  }));

  const handleUpdateStory = (updated: UserStory) => {
    setUserStories(prev => {
      const withoutOld = prev.filter(s => s.id !== updated.id);
      return [...withoutOld, updated];
  });
  };

  const handleSelectAll = () => {
    const allUserStoryIds = userStories.map(story => story.id);
    
    setSelectedUserStoriesIds(allUserStoryIds);
  };

  const handleSave = async () => {
    try {
      const selected = userStories.filter(story => selectedUserStoriesIds.includes(story.id));
  
      const cleaned = selected.map(s => ({
        idTitle: s.idTitle,
        title: s.title,
        description: s.description,
        priority: s.priority,
        points: s.points,
        acceptance_criteria: s.acceptance_criteria,
        assigned_epic: s.assigned_epic
      }));
  
      await postUserStories(cleaned, selectedProject!);
      alert('Historias de usuario guardadas con éxito!');
    } catch (err) {
      console.error('Error al guardar historias:', err);
    }
  };
  
  const handleImportEpics = async () => {
    try {
      const [importedEpics, importedRequirements] = await Promise.all([
        getProjectEpics(selectedProject!),
        getProjectRequirements(selectedProject!)
      ]);
  
      const epicsWithReqs = importedEpics.map(epic => {
        const related = importedRequirements.filter(r => r.epicRef === epic.idTitle);
        return {
          ...epic,
          relatedRequirements: related.map(r => ({
            idTitle: r.idTitle,
            title: r.idTitle,
            description: r.description
          }))
        };
      });
  
      setEpics(epicsWithReqs);
  
      const ids = epicsWithReqs.map(e => e.id);
      setSelectedEpicIds(ids);
  
      alert("Épicas (con requerimientos asociados) importadas!");
    } catch (err) {
      console.error("Error importando épicas y requerimientos:", err);
    }
  };

  const handleDeleteStory = (storyId: string) => {
    setUserStories(prev => prev.filter(story => story.id !== storyId));
    
    setSelectedUserStoriesIds(prev => prev.filter(id => id !== storyId));
  };
  
  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="userStories" />
      
      <Navbar projectSelected={true} />
      

      <GeneratorView
        inputTitle="📦 Epics Input"
        inputLabel="Describe your epics"
        inputValue={epicDescription}
        onInputChange={setEpicDescription}
        onGenerate={handleGenerate}
        onClear={() => {
          setEpicDescription('');
          setUserStories([]);
        }}
        generatedTitle="Generated User Stories"
        isEditMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        isLoading={isLoading}
        error={error}
        items={Object.entries(groupedByEpic)}
        renderItem={([epicId, stories]) => (
          <EpicUserStoryGroup
            key={epicId}
            id={epicId}
            idTitle={epicId}
            userStories={stories ?? []}
            editMode={editMode}
            onUpdate={handleUpdateStory}
            availableEpics={allEpicOptions}
            onDelete={handleDeleteStory}
          />
        )}
        renderLeftContent={() => (
          <div>
            <div className="flex items-baseline justify-between">
              <label className={inputproject.label}>Selected Epics</label>
              <button 
              className="text-[#4A2B4A] text-sm font-medium hover:underline"
              onClick={handleImportEpics}
            >
              Import from project's epics
            </button>
            </div>
            <div className="space-y-5 max-h-[60vh] overflow-y-auto">
              {selectedEpics.map((epic) => (
                <EpicCard
                  key={epic.id}
                  isSelected = {true}
                  {...epic}
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
