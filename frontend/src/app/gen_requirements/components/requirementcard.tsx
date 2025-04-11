'use client';

import { Requirement } from "@/types/requirement";
import { Check, Pencil, Circle } from 'lucide-react'; 
import { requirementCardStyles as styles} from "../styles/requirement.module";
import React, {useState} from 'react';
import RequirementEditModal from "./requirementeditmodal";

type Props = Pick<Requirement, 'id' | 'idTitle' | 'title' | 'description' | 'priority'> & {
  onUpdate: (updated: Requirement) => void;
  editMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete: (id: string) => void;
};

const RequirementCard = ({
    id,
    idTitle,
    title,
    description,
    priority,
    isSelected = false,
    onToggleSelect,
    onUpdate,
    editMode,
    onDelete,
}: Props) =>{
  const [openEdit, setOpenEdit] = useState(false)
  

   return (
    <>
      <div 
        className={`${styles.wrapper} ${!editMode ? 'hover:bg-[#EBE5EB] cursor-pointer' : ''}`}
        onClick={!editMode && onToggleSelect ? onToggleSelect : undefined}
      >
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <span className={styles.badge}>{idTitle}</span>
              <span className={styles.title}>{title}</span>
            </div>
          </div>
          <p className={styles.description}>{description}</p>
        </div>
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenEdit(true);
            }}
            aria-label="Edit requirement"
          >
            <Pencil size={16} className="text-[#4A2B4A]" />
          </button>
        )}

        {!editMode && (
          <div className="flex items-center justify-center">
            {isSelected ? (
              <Check size={16} className={`${styles.icon} bg-[#4A2B4A] text-white rounded-full`} />
            ) : (
              <Circle size={16} className={styles.icon} />
            )}
          </div>
        )}
      </div>

      <RequirementEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        requirement={{ id, idTitle, title, description, priority }}
        onSave={(updated) => {
          onUpdate(updated);
          setOpenEdit(false);
        }}
        onDelete={(deletedId) => {
          onDelete(deletedId);
          setOpenEdit(false);
        }}
      />
    </>
  );
};

export default  RequirementCard;