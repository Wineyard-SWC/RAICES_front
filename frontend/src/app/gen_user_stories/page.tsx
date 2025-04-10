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

export default function GenerateUserStoriesPage() {
  const [epicDescription, setEpicDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { userStories, setUserStories } = useUserStoryContext();
  const { epics } = useEpicContext();
  const {selectedEpicIds} = useSelectedEpicsContext();
  const { selectedUserStoriesIds, setSelectedUserStoriesIds} = useSelectedUserStoriesContext();



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

  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="userStories" />
      


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
            availableEpics={allEpicIds}
          />
        )}
        renderLeftContent={() => (
          <div className="space-y-5 max-h-[60vh] overflow-y-auto">
            <label className={inputproject.label}>Project's Epics</label>
            {selectedEpics.map((epic) => (
              <EpicCard
                key={epic.id}
                isSelected = {true}
                {...epic}
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
