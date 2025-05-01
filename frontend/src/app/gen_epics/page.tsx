'use client';

import { useState } from 'react';
import { Layers } from "lucide-react";
import GeneratorView from '@/components/generatorview';
import EpicCard from './components/epiccard';
import RequirementCard from '../gen_requirements/components/requirementcard';
import LoadingScreen from '@/components/animations/loading';
import Navbar from '@/components/NavBar';
import { projectInputStyles as input } from '../gen_requirements/styles/projectinput.module';
import { useGenerateEpicsLogic } from './hooks/useGenerateEpicLogic';
import ConfirmDialog from '@/components/confimDialog';


export default function GenerateEpicsPage() {
  const [reqDescription, setReqDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);


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
  } = useGenerateEpicsLogic(reqDescription, setReqDescription);
  
  return (
    <>
      <LoadingScreen isLoading={isLoading} generationType="epics"/>
    
      <Navbar projectSelected={true} />

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
        onGenerate={handleGenerate}
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
            onUpdate={handleUpdateEpic}
            onDelete={(uuid) => {
              handleDeleteEpic(uuid)
            }}
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
              Import from project's requirements
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
          message={`Are you sure you want to clear the epics and requirements?\nThis will reset all your progress in this and previous sections.`}
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
          title="Save Epics"
          message={`The epics you didn't select will not be included.\nYou can still access them as archived versions of the project.`}
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
          title="Import Requirements"
          message={`Importing from the database will overwrite the current selection.\nDo you want to continue?`}
          onCancel={() => setShowImportConfirm(false)}
          onConfirm={async () => {
            await handleImportRequirements();
            setShowImportConfirm(false);
          }}
        />
      )}
    </>
  );
}