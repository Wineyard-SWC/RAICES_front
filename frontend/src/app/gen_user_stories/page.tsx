'use client';

import { useState, useEffect } from 'react';
import { Book } from "lucide-react";
import EpicUserStoryGroup from './components/epicwithuserstoriescard';
import GeneratorView from '@/components/generatorview';
import { epicInputStyles as input } from "./styles/epicinput.module";
import { projectInputStyles as inputproject } from '../gen_requirements/styles/projectinput.module';
import EpicCard from '../gen_epics/components/epiccard';
import LoadingScreen from '@/components/loading';
import Navbar from '@/components/NavBar';
import { useGenerateUserStoriesLogic } from './hooks/useGenerateUserStoriesLogic';
import { UserStory } from '@/types/userstory';
import ConfirmDialog from '@/components/confimDialog';
import { useRouter } from 'next/navigation';

export default function GenerateUserStoriesPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const {
    epicDescription,
    setEpicDescription,
    editMode,
    setEditMode,
    handleGenerate,
    handleSave,
    handleImportEpics,
    handleDeleteStory,
    handleUpdateStory,
    handleSelectAll,
    handleClear,
    selectedEpics,
    selectedEpicIds,
    userStories,
    groupedByEpic,
    allEpicOptions,
    error,
    isLoading
  } = useGenerateUserStoriesLogic();
  
  const unassignedTuple: [string, UserStory[]] | null = userStories.some(
    us => us.assigned_epic === 'UNASSIGNED'
  )
    ? ['UNASSIGNED', userStories.filter(us => us.assigned_epic === 'UNASSIGNED')]
    : null;
  
  const allItems: [string, UserStory[]][] = [
    ...Object.entries(groupedByEpic),
    ...(unassignedTuple ? [unassignedTuple] : [])
  ];

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return null; 
  } 

  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="userStories" />
      
      <Navbar projectSelected={true} />
      

      <GeneratorView
        inputTitle={
          <div className="flex items-center gap-2 text-[#4A2B4D]">
            <Book className="w-8 h-8" />
            <span>Epics Input</span>
          </div>
        }
        inputLabel="Describe your epics"
        inputValue={epicDescription}
        onInputChange={setEpicDescription}
        onGenerate={() => {
          setShowGenerateConfirm(true)
        }}
        onClear={() => {
          setShowClearConfirm(true)
        }}
        generatedTitle="Generated User Stories"
        isEditMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        isLoading={isLoading}
        error={error}
        items={allItems}
        renderItem={([epicId, stories]) => (
          <>
            <EpicUserStoryGroup
              key={epicId}
              id={epicId}
              uuid={epicId}
              idTitle={epicId === 'UNASSIGNED' ? 'Unassigned' : epicId}    
              userStories={stories ?? []}
              editMode={editMode}
              onUpdate={handleUpdateStory}
              availableEpics={allEpicOptions}
              onDelete={handleDeleteStory}
            />
            
          </>
        )}
        
        renderLeftContent={() => (
          <div>
            <div className="flex items-baseline justify-between">
              <label className={inputproject.label}>Selected Epics</label>
              <button 
              className="text-[#4A2B4A] text-sm font-medium hover:underline"
              onClick={() => setShowImportConfirm(true)}
              >
              Import from project's epics
            </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedEpics.map((epic) => (
                <EpicCard
                  key={epic.uuid}
                  isSelected = {selectedEpicIds.includes(epic.uuid)}
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
        onSave={() => setShowSaveConfirm(true)}
      />

      {showClearConfirm && (
        <ConfirmDialog
          open={showClearConfirm}
          title="Clear User Stories Section"
          message={`Are you sure you want to clear the user stories and epics?\nThis will reset all your progress in this and previous sections.`}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={() => {
            handleClear();
            setShowClearConfirm(false);
          }}
      />
      )}

      {showSaveConfirm && (
        <ConfirmDialog
          open={showSaveConfirm}
          title="Save User Stories"
          message={`The stories you didn't select will not be included.\nYou can still access them later as part of the archived project.`}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={async () => {
            await handleSave();
            setShowSaveConfirm(false);
          }}
        />
      )}


      {showImportConfirm && (
        <ConfirmDialog
          open={showImportConfirm}
          title="Import Epics"
          message={`Importing from the database will overwrite the current epics.\nAre you sure you want to continue?`}
          onCancel={() => setShowImportConfirm(false)}
          onConfirm={async () => {
            await handleImportEpics();
            setShowImportConfirm(false);
          }}
        />
      )}

      {showGenerateConfirm && (
        <ConfirmDialog
          open={showGenerateConfirm}
          title="Generating User Stories"
          message={`Generating user stories will overwrite the current selection and it will be lost if it is not saved.\nDo you want to continue?`}
          onCancel={() => setShowGenerateConfirm(false)}
          onConfirm={async () => {
            await handleGenerate();
            setShowGenerateConfirm(false);
          }}
        />
      )}
    </>
  );
}
