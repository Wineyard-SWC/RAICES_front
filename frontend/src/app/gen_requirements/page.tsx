'use client';


import LoadingScreen from '@/components/loading';
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


export default function RequirementsPage() {
  const { projectDescription, setProjectDescription } = useProjectContext();
  const [editMode, setEditMode] = useState(false);
  const { setEpics} = useEpicContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);



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

  
  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="requirements" />
    
      <Navbar projectSelected={true} />

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
        onGenerate={handleGenerate}
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
            onUpdate={(updated) =>
              setRequirements((prev) =>
                prev.map((r) => (r.uuid === updated.uuid ? updated : r))
              )
            }
            editMode={editMode}
            onDelete={(deletedId) => handleDeleteRequirement(deletedId, setRequirements, setSelectedIds, setEpics)}
          />
        )}
        onSelectAll={() => handleSelectAll(requirements, setSelectedIds)}
        isLoading={isLoading}
        error={error}
        onSave={() => setShowSaveConfirm(true)}
        />    
      
      {showClearConfirm && (
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Requirements Section"
        message="Are you sure you want to clear the requirements and description?  This will reset all your progress in this section."
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
          title="Save Requirements"
          message={`Only the selected requirements will be saved.\nUnselected ones will remain archived in the project history.`}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={async () => {
            await handleSave(requirements, selectedIds, selectedProject);
            setShowSaveConfirm(false);
          }}
        />
      )}


    </>


  );
}