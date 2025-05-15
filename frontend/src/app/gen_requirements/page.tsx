'use client';


import LoadingScreen from '@/components/animations/loading';
import { FileText } from "lucide-react";
import Navbar from '@/components/NavBar';
import RequirementCard from './components/requirementcard';
import GeneratorView from '@/components/generatorview';
import { useState, useEffect } from 'react';
import { useProjectContext } from '@/contexts/projectcontext';
import toggleSelectRequirement from './utils/toggleSelectRequirement';
import handleSelectAll from './utils/handleSelectAll';
import handleSave from './utils/handleSave';
import handleDeleteRequirement from './utils/handleDeleteRequirement';
import { useRequirementsLogic } from './hooks/useRequirementsLogic';
import { useEpicContext } from '@/contexts/epiccontext';
import ConfirmDialog from '@/components/confimDialog';
import { useRouter } from 'next/navigation';
import useToast from '@/hooks/useToast';
import Toast from '@/components/toast';

export default function RequirementsPage() {
  const { projectDescription, setProjectDescription } = useProjectContext();
  const [editMode, setEditMode] = useState(false);
  const { setEpics} = useEpicContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    requirements,
    setRequirements,
    selectedIds,
    setSelectedIds,
    selectedProject,
    isLoading,
    error,
    handleGenerate,
    handleClear
  } = useRequirementsLogic({ projectDescription, setProjectDescription });

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSaveWithConfirmation = async () => {
    try {
      setIsSaving(true);
      await handleSave(requirements, selectedIds, selectedProject);
      showToast('Requirements saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving requirements:', error);
      showToast('Error saving requirements. Please try again.', 'error');
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
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
      <LoadingScreen isLoading={isLoading} generationType="requirements" />
    
      <Navbar projectSelected={true} />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />

      <GeneratorView
        showInput={true}
        inputTitle={
          <div className="flex items-center gap-2 text-[#4A2B4D]">
            <FileText className="w-8 h-8" />
            <span>Project Input</span>
          </div>
        }
        inputLabel="Project's Description"
        inputValue={projectDescription}
        onInputChange={setProjectDescription}
        onGenerate={() => {
          setShowGenerateConfirm(true)
        }}
        onClear={() => {
          setShowClearConfirm(true)
        }}
        generatedTitle="Generated Requirements"
        isEditMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        items={requirements}
        renderItem={(req) => (
          <RequirementCard
            key={req.uuid}
            {...req}
            idTitle={`${req.idTitle}`}
            isSelected={selectedIds.includes(req.uuid)}
            onToggleSelect={() => toggleSelectRequirement(req.uuid,setSelectedIds)}
            onUpdate={(updated) =>{
              setRequirements((prev) =>
                prev.map((r) => (r.uuid === updated.uuid ? updated : r))
              )
              showToast('Requirement updated successfully', 'success');
            }}
            editMode={editMode}
            onDelete={
              (deletedId) => {handleDeleteRequirement(deletedId, setRequirements, setSelectedIds, setEpics)
              showToast('Requirement deleted successfully', 'success');
              }
            }
          />
        )}
        onSelectAll={() => {
          handleSelectAll(requirements, setSelectedIds);
          if (requirements.length > 0) {
            showToast('All requirements selected', 'success');
          }
        }}
        isLoading={isLoading}
        error={error}
        onSave={() => setShowSaveConfirm(true)}
        />    
      
      {showClearConfirm && (
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Requirements Section"
        message={`Are you sure you want to clear the requirements section?\nThis will reset your progress in all sections.`}
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => { 
          handleClear();
          setShowClearConfirm(false);
          showToast('All info cleared successfully', 'success');
        }}
      />
      )}

      {showSaveConfirm && (
        <ConfirmDialog
          open={showSaveConfirm}
          title="Save Requirements"
          message={`Only the selected requirements will be saved.\nUnselected ones will remain archived in the project history.`}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSaveWithConfirmation}
          isLoading={isSaving}
          confirmText={isSaving ? "Saving..." : "Save"}
        />
      )}

      {showGenerateConfirm && (
        <ConfirmDialog
          open={showGenerateConfirm}
          title="Generating Requirements"
          message={`Generating requirements will overwrite the current selection and restart all your progress in this and next sections it will be lost if it is not saved.\nDo you want to continue?`}
          onCancel={() => setShowGenerateConfirm(false)}
          onConfirm={async () => {
            if (projectDescription.trim() === "") {
              showToast('A project description must be provided first to generate content', 'info');
            }
            await handleGenerate();
            setShowGenerateConfirm(false);
          }}
          isLoading={isGenerating}
          confirmText={isGenerating ? "Generating..." : "Generate"}
        />
      )}
    </>


  );
}