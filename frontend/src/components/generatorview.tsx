'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { projectInputStyles as input } from '@/app/gen_requirements/styles/projectinput.module';
import { generatedReqStyles as gen} from '@/app/gen_requirements/styles/genreq.module';
import { FlowTabs } from './changegenerativeview';
import EpicCard from '@/app/gen_epics/components/epiccard';
import AddManualModal from './addManualModal';
import ManualEpicForm from '@/app/gen_epics/components/ManualEpicForm';
import ManualRequirementForm from '@/app/gen_requirements/components/ManualRequirementForm';
import ManualUserStoryForm from './ManualUserStoryForm';

import { useRequirementContext } from '@/contexts/requirementcontext';
import { useEpicContext } from '@/contexts/epiccontext';
import { useUserStoryContext } from '@/contexts/userstorycontext';


type GeneratorViewProps<T> = {
  showInput?: boolean;
  inputTitle?: string;
  inputLabel?: string;
  inputValue?: string;
  onInputChange: (val: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  generatedTitle: string;
  isEditMode: boolean;
  onToggleEdit: () => void;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  renderLeftContent?: () => React.ReactNode;
  onSelectAll?: () => void;
  isItemSelectable?: boolean;
  onSave?: () => void;
};

const GeneratorView = <T,>({
  showInput,
  inputTitle,
  inputLabel,
  inputValue,
  onInputChange,
  onGenerate,
  onClear,
  generatedTitle,
  isEditMode,
  onToggleEdit,
  items,
  renderItem,
  isLoading,
  error,
  renderLeftContent,
  onSelectAll,
  isItemSelectable = true,
  onSave
}: GeneratorViewProps<T>) => {
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState(pathname);
  const isRequirementsView = currentTab === '/gen_requirements';
  const [showAddModal, setShowAddModal] = useState(false);

  const { requirements, setRequirements } = useRequirementContext();
  const { epics, setEpics } = useEpicContext();
  const { userStories, setUserStories } = useUserStoryContext();

  const getAvailableRequirements = () => {
    return items.map((item: any) => ({
      idTitle: item.idTitle,
      title: item.title,
      description: item.description
    }));
  };
  
  const getAvailableEpicIds = () => {
    return items.map((item: any) => item.idTitle);
  };
  

  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#EBE5EB]/30 px-4 py-10">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-screen-xl min-h-[60vh]">
      
        {/* Input panel */}
        <div className={`${input.wrapper} flex flex-col justify-between h-full min-h-[60vh]`}>
          <div>
            <h2 className={input.title}>
              <span className="text-2xl"></span> {inputTitle}
            </h2>
            
            <FlowTabs currentPath={currentTab} onTabChange={setCurrentTab} isLoading={isLoading}/>
            
            {renderLeftContent ? (
              renderLeftContent() 
            ) : showInput ? (
              <>
                <label className={input.label}>Project's Description</label>
                <textarea
                  className={`${input.textarea} overflow-hidden`}
                  value={inputValue}
                  placeholder="Describe your project goals, target users, key features and any specific requirements you already know..."
                  onChange={(e) =>{
                     onInputChange?.(e.target.value);
                     const textarea = e.target;
                      textarea.style.height = 'auto'; 
                      textarea.style.height = `${textarea.scrollHeight}px`
                    }}
                    rows={1}
                />
              </>
            ) : null}
          </div>
          
          <div className={input.actions}>
            {error && <p className="text-sm text-red-600 font-medium mb-2">{error}</p>}
            <div className="flex gap-4 w-full">
              <button 
                className={input.generateButton} 
                onClick={onGenerate} 
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : `Generate ${isRequirementsView ? 'Requirements' : currentTab.includes('epics') ? 'Epics' : 'User Stories'}`}
              </button>
              <button className={input.clearButton} onClick={onClear} disabled={isLoading}
              >Clear</button>
            </div>
          </div>
        </div>

        {/* Output panel */}
        <div className={`${gen.wrapper} flex flex-col justify-between h-full min-h-[60vh]`}>
          <div>
            <div className={gen.header}>
              <h2 className={gen.title}>
                {isRequirementsView ? 'Generated Requirements' : 
                 currentTab.includes('epics') ? 'Generated Epics' : 'Generated User Stories'}
              </h2>
              <div className={gen.viewToggle}>
                <button 
                  className={!isEditMode ? gen.viewActive : gen.viewInactive}
                  onClick={() => !isEditMode || onToggleEdit()}
                >
                  List View
                </button>
                <button 
                  className={isEditMode ? gen.viewActive : gen.viewInactive}
                  onClick={() => isEditMode || onToggleEdit()}
                >
                  Edit View
                </button>
              </div>
            </div>

              <div className={gen.list}>   
              {items.length > 0 ? (
                items.map(renderItem)
              ) : (
                <div className="text-center py-15 text-gray-500">
                {isRequirementsView 
                  ? "Enter your project description and click Generate to create requirements"
                  : `No ${currentTab.includes('epics') ? 'epics' : 'user stories'} generated yet`}
                </div>
              )}
              </div>
      

          </div>
      
          <div className="flex justify-center mt-1 mb-10 ">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-sm text-[#4A2B4A] underline hover:text-[#2d1a2d]"
            >
              {!isEditMode ? '' : '+ Add manually'} 
            </button>
          </div>

          <div className={`${gen.actions} w-full grid grid-cols-3 gap-3`}>
            
            <button 
              className={`${gen.button} w-full flex justify-center`}
              onClick={onSelectAll}
              disabled={!isItemSelectable || items.length === 0}
              >
              <span className="text-lg mr-2">📋</span> Select all
            </button>

            <button className={`${gen.button} w-full flex justify-center`}
                onClick={onSave}
                disabled={!isItemSelectable || items.length === 0}
              >
              <span className="text-lg mr-2">⬇️</span> Save 
              
            </button>

            <button className={`${gen.button} w-full flex justify-center`}
              onClick={onGenerate}
              disabled={isLoading}
            >
              <span className="text-lg mr-2">🔄</span> Regenerate
            </button>
          </div>

        </div>
      </div>
        <AddManualModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(item) => {
          if (isRequirementsView) {
            setRequirements((prev: any) => [...prev, item as T]);
          } else if (currentTab.includes('epics')) {
            setEpics((prev: any) => [...prev, item as T]);
          } else {
            setUserStories((prev: any) => [...prev, item as T]);
          };
          setShowAddModal(false);
        }}
        renderForm={(onSubmit, onCancel) => {
          const nextId = (() => {
            if (isRequirementsView) return requirements.length + 1;
            else if (currentTab.includes('epics')) return epics.length + 1;
            else if (!currentTab.includes('epics')) return userStories.length + 1;
            return 1;
          })();

          if (isRequirementsView) {
            return (
              <ManualRequirementForm
                onSubmit={onSubmit}
                onCancel={onCancel}
                nextId={nextId}
              />
            );
          }

          if (currentTab.includes('epics')) {
            return (
              <ManualEpicForm
                onSubmit={onSubmit}
                onCancel={onCancel}
                nextId={nextId}
                availableRequirements={requirements.map((r) => ({
                  idTitle: r.idTitle,
                  title: r.title,
                  description: r.description,
                }))}
              />
            );
          }

          if (!currentTab.includes('epics')) {
            return (
              <ManualUserStoryForm
                onSubmit={onSubmit}
                onCancel={onCancel}
                nextId={nextId}
                availableEpics={epics.map((e) => e.idTitle+"-"+e.title)}
              />
            );
          }

          return (
            <div>No form available</div>
          );        
        }}
      />
  

    </div>
  );
};

export default GeneratorView;