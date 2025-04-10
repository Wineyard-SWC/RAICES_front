'use client'

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { projectInputStyles as input } from '@/app/gen_requirements/styles/projectinput.module';
import { generatedReqStyles as gen} from '@/app/gen_requirements/styles/genreq.module';
import { FlowTabs } from './changegenerativeview';
import EpicCard from '@/app/gen_epics/components/epiccard';

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
  
  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname]);


  const isRequirementsView = currentTab === '/gen_requirements';

  return (
    <div className="min-h-screen bg-[#EBE5EB] px-4 py-10">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-screen-xl min-h-[60vh]">
      
        {/* Input panel */}
        <div className={`${input.wrapper} flex flex-col justify-between h-full min-h-[60vh]`}>
          <div>
            <h2 className={input.title}>
              <span className="text-2xl"></span> {inputTitle}
            </h2>
            
            <FlowTabs currentPath={currentTab} onTabChange={setCurrentTab} />
            
            {renderLeftContent ? (
              renderLeftContent() 
            ) : showInput ? (
              <>
                <label className={input.label}>Project's Description</label>
                <textarea
                  className={`${input.textarea} resize-none`}
                  value={inputValue}
                  placeholder="Describe your project goals, target users, key features and any specific requirements you already know..."
                  onChange={(e) => onInputChange?.(e.target.value)}
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
              <button className={input.clearButton} onClick={onClear}>Clear</button>
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

            <button className={`${gen.button} w-full flex justify-center`}>
              <span className="text-lg mr-2">🔄</span> Regenerate
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GeneratorView;