'use client';

import { useState, useEffect } from 'react';
import { Book } from "lucide-react";
import EpicUserStoryGroup from './components/epicwithuserstoriescard';
import GeneratorView from '@/components/generatorview';
import { epicInputStyles as input } from "./styles/epicinput.module";
import { projectInputStyles as inputproject } from '../gen_requirements/styles/projectinput.module';
import EpicCard from '../gen_epics/components/epiccard';
import LoadingScreen from '@/components/animations/loading';
import Navbar from '@/components/NavBar';
import { useGenerateUserStoriesLogic } from './hooks/useGenerateUserStoriesLogic';
import { UserStory } from '@/types/userstory';
import ConfirmDialog from '@/components/confimDialog';
import { useRouter } from 'next/navigation';
import Toast from '@/components/toast';
import useToast from '@/hooks/useToast';
import { printError } from '@/utils/debugLogger';

export default function GenerateUserStoriesPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showImportUSConfirm, setShowImportUSConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    epicDescription,
    setEpicDescription,
    editMode,
    setEditMode,
    handleGenerate,
    handleSave,
    handleImportEpics,
    handleImportUserStories,
    handleDeleteStory,
    handleUpdateStory,
    handleSelectAll,
    handleClear,
    selectedEpics,
    selectedEpicIds,
    userStories,
    groupedByEpic,
    groupingVersion,
    allEpicOptions,
    error,
    isLoading
  } = useGenerateUserStoriesLogic();

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


  const handleSaveWithFeedback = async () => {
    try {
      await handleSave();
      showToast('User stories saved successfully!', 'success');
    } catch (error) {
      printError('Error saving user stories:', error);
      showToast('Error saving user stories. Please try again.', 'error');
    } finally {
      setShowSaveConfirm(false);
    }
  };
  
  const handleImportWithFeedback = async () => {
    try {
      await handleImportEpics();
      showToast('Epics and requirements imported successfully!', 'success');
    } catch (error) {
      printError('Error importing epics:', error);
      showToast('Error importing epics. Please try again.', 'error');
    } finally {
      setShowImportConfirm(false);
    }
  };

  const handleImportUSWithFeedback = async () => {
    try {
      await handleImportUserStories();
      showToast('User stories imported successfully!', 'success');
    } catch (error) {
      printError('Error importing user stories:', error);
      showToast('Error importing user stories. Please try again.', 'error');
    } finally {
      setShowImportUSConfirm(false);
    }
  };
  
  const handleGenerateWithFeedback = async () => {
    try {
      await handleGenerate();
      if (!isLoading){
        showToast('User stories generated successfully!', 'success');
      }
    } catch (error) {
      showToast('Error generating user stories. Please try again.', 'error');
    } finally {
      setShowGenerateConfirm(false);
    }
  };
  
  const handleClearWithFeedback = () => {
    handleClear();
    setShowClearConfirm(false);
    showToast('All info cleared successfully.', 'success');
  };

  const handleDeleteWithToast = () => {
    showToast('User story deleted successfully.', 'success');
  };
  
  const handleUpdateWithToast = () => {
    showToast('User story updated successfully.', 'success');
  };

  if (loading) {
    return null; 
  }

  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="userStories" />
      
      <Navbar projectSelected={true} />
      
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />

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
        items={Object.entries(groupedByEpic)}
        renderItem={([epicId, stories]) => (
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
              onDeleteWithToast={handleDeleteWithToast}
              onUpdateWithToast={handleUpdateWithToast}
            />
        )}
        
        renderLeftContent={() => (
          <div>
            <div className="flex items-baseline justify-between">
              <label className={inputproject.label}>Selected Epics</label>
              <button 
              className="text-[#4A2B4A] text-sm font-medium hover:underline"
              onClick={() => setShowImportConfirm(true)}
              >
              Import Epics and Requirements
            </button>
            <button 
              className="text-[#4A2B4A] text-sm font-medium hover:underline"
              onClick={() => setShowImportUSConfirm(true)}
              >
              Import User Stories
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
          message={`Are you sure you want to clear the user stories\nThis will reset all your progress in this section.`}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={handleClearWithFeedback}
      />
      )}

      {showSaveConfirm && (
        <ConfirmDialog
          open={showSaveConfirm}
          title="Save User Stories"
          message={`Importing from the database will bring in all epics and their related requirements.\nThis will overwrite your current selection.\nAre you sure you want to continue?`}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSaveWithFeedback}
          isLoading={isSaving}
          confirmText={isSaving ? "Saving..." : "Save"}
        />
      )}


      {showImportConfirm && (
        <ConfirmDialog
          open={showImportConfirm}
          title="Import Epics and Requirementes"
          message={`Importing from the database will overwrite the current epics and requirements.\nAre you sure you want to continue?`}
          onCancel={() => setShowImportConfirm(false)}
          onConfirm={handleImportWithFeedback}
          isLoading={isImporting}
          confirmText={isImporting ? "Importing..." : "Import"}
        />
      )}

      {showImportUSConfirm && (
        <ConfirmDialog
          open={showImportUSConfirm}
          title="Import User Stories"
          message={`Importing from the database will overwrite the current user stories.\nAre you sure you want to continue?`}
          onCancel={() => setShowImportUSConfirm(false)}
          onConfirm={handleImportUSWithFeedback}
          isLoading={isImporting}
          confirmText={isImporting ? "Importing..." : "Import"}
        />
      )}

      {showGenerateConfirm && (
        <ConfirmDialog
          open={showGenerateConfirm}
          title="Generating User Stories"
          message={`Generating user stories will overwrite the current selection and it will be lost if it is not saved.\nDo you want to continue?`}
          onCancel={() => setShowGenerateConfirm(false)}
          onConfirm={handleGenerateWithFeedback}
          isLoading={isGenerating}
          confirmText={isGenerating ? "Generating..." : "Generate"}
        />
      )}
    </>
  );
}
