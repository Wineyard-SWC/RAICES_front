'use client'

import React from 'react';
import { projectInputStyles as input } from '@/app/gen_requirements/styles/projectinput.module';
import { generatedReqStyles as gen} from '@/app/gen_requirements/styles/genreq.module';

type GeneratorViewProps<T> = {
  inputTitle: string;
  inputLabel: string;
  inputValue: string;
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
};

const GeneratorView = <T,>({
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
  error
  
}: GeneratorViewProps<T>) => {
    return (
        <div className="min-h-screen bg-[#EBE5EB] px-4 md:px-12 xl:px-14 py-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left input panel */}
            <div className={`min-w-[40vw]w-[60vw] max-w-[70vw] max-h-[80vh] h-[40vh] min-h-[60vh] ${input.wrapper} flex flex-col justify-between`}>
              <h2 className={input.title}>{inputTitle}</h2>
      
              <label className={input.label}>{inputLabel}</label>
              <textarea
                className={`${input.textarea} resize-y overflow-auto min-h-[20vh]`}
                value={inputValue}
                placeholder="Enter your input here..."
                onChange={(e) => onInputChange(e.target.value)}
              />
      
              <div className={input.actions}>
                <button className={input.generateButton} onClick={onGenerate}>
                   Generate
                </button>
                <button className={input.clearButton} onClick={onClear}>
                   Clear
                </button>
              </div>
            </div>
      
            {/* Right output panel */}
            <div className={`min-w-[40vw]w-[60vw] max-w-[80vw] max-h-[70vh] h-[40vh] min-h-[60vh] ${gen.wrapper} flex flex-col justify-between`}>
              <div className={gen.header}>
                <h2 className={gen.title}>{generatedTitle}</h2>
                <div className={gen.viewToggle}>
                  <button
                    className={isEditMode ? gen.viewInactive : gen.viewActive}
                    onClick={onToggleEdit}
                  >
                    List View
                  </button>
                  <button
                    className={isEditMode ? gen.viewActive : gen.viewInactive}
                    onClick={onToggleEdit}
                  >
                    Edit View
                  </button>
                </div>
              </div>
      
              <div className={gen.list}>
                {isLoading && (
                  <p className="text-sm text-gray-500 italic"> Generating...</p>
                )}
                {error && (
                  <p className="text-sm text-red-600 font-medium"> {error}</p>
                )}
                {items.map(renderItem)}
              </div>
      
              <div className={gen.actions}>
                <button className={gen.button}>📋 Copy all</button>
                <button className={gen.button}>⬇️ Export</button>
                <button className={gen.button}>🔄 Regenerate</button>
              </div>
            </div>
          </div>
        </div>
      );
};

export default GeneratorView;