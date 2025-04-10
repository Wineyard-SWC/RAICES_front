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
  onUpdate
}: Props) => {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className="flex items-center justify-between">
            <div>
              <span className={styles.badge}>{`${idTitle.toString().padStart(2, '0')}`}</span>
              <span className={styles.title}>{title}</span>
            </div>
              {editMode && (
                    <button 
                    className={styles.plusIcon}
                    onClick={() => setOpenEdit(true)} 
                    aria-label="Edit requirement">
                      <Pencil size={16} className="text-[#4A2B4A]" />
                    </button>
                  )}
              {!editMode && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    if (onToggleSelect) onToggleSelect();
                  }} 
                  aria-label={isSelected ? "Deselect epic" : "Select epic"}
                  className="flex items-center justify-center"
                >
                  {isSelected ? (
                    <Check size={16} className={`${styles.plusIcon} bg-[#4A2B4A] text-white rounded-full`} />
                  ) : (
                    <Circle size={16} className={styles.plusIcon} />
                  )}
                </button>
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
      />
    </>
  );
};

export default EpicCard;
