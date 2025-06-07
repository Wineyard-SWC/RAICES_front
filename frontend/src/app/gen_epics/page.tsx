'use client';

import { useState, useEffect } from 'react';
import { Layers } from "lucide-react";
import GeneratorView from '@/components/generatorview';
import EpicCard from './components/epiccard';
import RequirementCard from '../gen_requirements/components/requirementcard';
import LoadingScreen from '@/components/animations/loading';
import Navbar from '@/components/NavBar';
import { projectInputStyles as input } from '../gen_requirements/styles/projectinput.module';
import { useGenerateEpicsLogic } from './hooks/useGenerateEpicLogic';
import ConfirmDialog from '@/components/confimDialog';
import { useRouter } from 'next/navigation';
import saveRequirements  from '../gen_requirements/utils/handleSave';
import Toast from '@/components/toast';
import useToast from '@/hooks/useToast';
import { printError } from '@/utils/debugLogger';

export default function GenerateEpicsPage() {
  const [reqDescription, setReqDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const {
    epics,
    requirements,
    selectedIds,
    selectedEpicIds,
    selectedRequirements,
    isLoading,
    error,
    handleGenerate,
    handleUpdateEpic,
    handleSave,
    handleSelectAll,
    handleDeleteEpic,
    handleClear,
    toggleSelectEpic,
    handleImportRequirements,
    setRequirements,
    setEpics,
    setSelectedIds,
    setSelectedEpicIds,
    selectedProject
  } = useGenerateEpicsLogic(reqDescription, setReqDescription);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSaveWithFeedback = async () => {
    try {
      setIsSaving(true);
      await handleSave();
      showToast('Epics saved successfully!', 'success');
    } catch (error) {
      printError('Error saving epics:', error);
      showToast('Error saving epics. Please try again.', 'error');
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };
  
  const handleImportWithFeedback = async () => {
    try {
      setIsImporting(true);
      await handleImportRequirements();
      showToast('Requirements imported successfully!', 'success');
    } catch (error) {
      printError('Error importing requirements:', error);
      showToast('Error importing requirements. Please try again.', 'error');
    } finally {
      setIsImporting(false);
      setShowImportConfirm(false);
    }
  };
  
  const handleGenerateWithFeedback = async () => {
    try {
      setIsGenerating(true);
      await handleGenerate();
      showToast('Epics generated successfully!', 'success');
    } catch (error) {
    } finally {
      setIsGenerating(false);
      setShowGenerateConfirm(false);
    }
  };
  
  const handleClearWithFeedback = () => {
    handleClear();
    setShowClearConfirm(false);
    showToast('All info cleared successfully', 'success');
  };
  
  const handleDeleteWithFeedback = (uuid: string) => {
    handleDeleteEpic(uuid);
    showToast('Epic deleted successfully', 'success');
  };

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
      <LoadingScreen isLoading={isLoading} generationType="epics"/>
    
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
            <Layers className="w-8 h-8" />
            <span>Requirements Input</span>
          </div>
        }
        inputLabel="List your requirements"
        inputValue={reqDescription}
        onInputChange={setReqDescription}
        onGenerate={() => {
          setShowGenerateConfirm(true)
        }}
        onClear={() => {
          setShowClearConfirm(true)
        }}
        generatedTitle="Generated Epics"
        isEditMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        isLoading={isLoading}
        error={error}
        items={epics}
        renderItem={(epic) => (
          <EpicCard
            key={epic.uuid}
            {...epic}
            isSelected={selectedEpicIds.includes(epic.uuid)}
            onToggleSelect={() => toggleSelectEpic(epic.uuid)}
            editMode={editMode}
            onUpdate={(updatedEpic) => {
              handleUpdateEpic(updatedEpic);
              showToast('Epic updated successfully', 'success');
            }}
            onDelete={(uuid) => handleDeleteWithFeedback(uuid)}
          />
        )}
        renderLeftContent={() => (
          <div>
            <div className="flex items-baseline  justify-between">
            <label className={input.label}>Selected Requirements</label>
            <button 
              className="text-[#4A2B4A] text-sm font-medium hover:underline"
              onClick={() => setShowImportConfirm(true)}
              >
              Import Requirements
            </button>
            </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          
            {selectedRequirements.map((req) => (
              <RequirementCard
                key={req.uuid}
                {...req}
                isSelected = {selectedIds.includes(req.uuid)}
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
        onSave={() => setShowSaveConfirm(true)}
      />

      {showClearConfirm && (
        <ConfirmDialog
          open={showClearConfirm}
          title="Clear Epics Section"
          message={`Are you sure you want to clear the epics?\nThis will reset all your progress in this and next sections.`}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={handleClearWithFeedback}
      />
      )}

      {showSaveConfirm && (
        <ConfirmDialog
          open={showSaveConfirm}
          title="Save Epics"
          message={`Saving your current progress.\n The epics and requirements you didn't select will not be included.\nYou can still access them as archived versions of the project.`}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSaveWithFeedback}
          isLoading={isSaving}
          confirmText={isSaving ? "Saving..." : "Save"}
        />
      )}

      {showImportConfirm && (
        <ConfirmDialog
          open={showImportConfirm}
          title="Import Requirements"
          message={`Importing requirements from the database will bring in all saved requirements.\nThis will overwrite your current selection.\nDo you want to continue?`}
          onCancel={() => setShowImportConfirm(false)}
          onConfirm={handleImportWithFeedback}
          isLoading={isImporting}
          confirmText={isImporting ? "Importing..." : "Import"}
        />
      )}

      {showGenerateConfirm && (
        <ConfirmDialog
          open={showGenerateConfirm}
          title="Generating Epics"
          message={`Generating epics will overwrite the current selection and it will be lost if it is not saved.\nDo you want to continue?`}
          onCancel={() => setShowGenerateConfirm(false)}
          onConfirm={handleGenerateWithFeedback}
          isLoading={isGenerating}
          confirmText={isGenerating ? "Generating..." : "Generate"}
        />
      )}
    </>
  );
}