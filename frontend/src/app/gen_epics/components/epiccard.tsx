'use client';

import { Epic } from '@/types/epic';
import { epicCardStyles as styles } from '../styles/epic.module';
import { CheckCircle, Pencil, Plus } from 'lucide-react';
import React, { useState } from 'react';
import EpicEditModal from './epiceditmodal';

type Props = Pick<Epic, 'id' | 'title' | 'idTitle' | 'description' | 'relatedRequirements'> & {
  editMode?: boolean;
  onUpdate: (updated: Epic) => void;
};

const EpicCard = ({
  id,
  idTitle,
  title,
  description,
  relatedRequirements,
  editMode = false,
  onUpdate
}: Props) => {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className="flex items-center justify-between">
            <div>
              <span className={styles.badge}>{`EPIC-${idTitle.toString().padStart(2, '0')}`}</span>
              <span className={styles.title}>{title}</span>
            </div>
            {editMode && (
              <button onClick={() => setOpenEdit(true)} aria-label="Edit Epic">
                <Pencil size={16} className="text-[#4A2B4A]" />
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

        <button className={styles.plusIcon} aria-label="Add Requirement">
          <Plus size={18} />
        </button>
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
