'use client';

import { Epic } from '@/types/epic';
import { epicCardStyles as styles } from '../styles/epic.module';
import { CheckCircle, Check, Pencil, Circle } from 'lucide-react';
import React, { useState } from 'react';
import EpicEditModal from './epiceditmodal';

type Props = Pick<Epic, 'id' | 'title' | 'idTitle' | 'description' | 'relatedRequirements'> & {
  editMode?: boolean;
  onUpdate: (updated: Epic) => void;
  isSelected?: boolean;
  onDelete: (id: string) => void;
  onToggleSelect?: () => void;
};

const EpicCard = ({
  id,
  idTitle,
  title,
  description,
  relatedRequirements,
  editMode = false,
  isSelected = false,
  onToggleSelect,
  onUpdate,
  onDelete,
}: Props) => {
  const [openEdit, setOpenEdit] = useState(false);
  

  return (
    <>
      <div 
        className={`${styles.wrapper} ${!editMode ? 'hover:bg-[#EBE5EB] cursor-pointer' : ''}`} 
        onClick={!editMode && onToggleSelect ? onToggleSelect : undefined}>
        <div className={styles.header}>
          <div className="flex items-center justify-between">
            <div>
              <span className={styles.badge}>{`${idTitle.toString().padStart(2, '0')}`}</span>
              <span className={styles.title}>{title}</span>
            </div>
              {editMode && (
                    <button 
                    className={styles.plusIcon}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setOpenEdit(true);
                    }} 
                    aria-label="Edit requirement">
                      <Pencil size={16} className="text-[#4A2B4A]" />
                    </button>
                  )}
              {!editMode && (
                <div className="flex items-center justify-center">
                  {isSelected ? (
                    <Check size={16} className={`${styles.plusIcon} bg-[#4A2B4A] text-white rounded-full`} />
                  ) : (
                    <Circle size={16} className={styles.plusIcon} />
                  )}
                </div>
              )}
          </div>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.requirementsWrapper}>
          <p className={styles.relatedTitle}>Related Requirements</p>
          <ul className="space-y-1">
            {relatedRequirements.map((req) => (
              <li key={req.title} className={styles.requirementItem}>
                <CheckCircle size={14} className={styles.requirementCheck} />
                <span>{req.title}: {req.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <EpicEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        epic={{ id, idTitle, title, description, relatedRequirements }}
        onSave={(updated) => {
          onUpdate(updated);
          setOpenEdit(false);
        }}
        onDelete={(id) => {
          onDelete(id);
          setOpenEdit(false);
        }}
      />
    </>
  );
};

export default EpicCard;
