'use client';

import { Requirement } from "@/types/requirement";
import { Check, Pencil, Circle } from 'lucide-react'; 
import { requirementCardStyles as styles} from "../styles/requirement.module";
import React, {useState} from 'react';
import RequirementEditModal from "./requirementeditmodal";

type Props = Pick<Requirement, 'id' | 'idTitle' | 'title' | 'description' | 'priority'| 'category'|'uuid'> & {
  onUpdate: (updated: Requirement) => void;
  editMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete: (uuid: string) => void;
};

const RequirementCard = ({
    id,
    uuid,
    idTitle,
    title,
    description,
    priority,
    category,
    isSelected = false,
    onToggleSelect,
    onUpdate,
    editMode,
    onDelete,
}: Props) =>{
  const [openEdit, setOpenEdit] = useState(false)
  
  const isNonFunctional = idTitle.includes('-NF-');

   return (
    <>
      <div
        className={`${styles.wrapper} ${!editMode ? 'hover:bg-[#EBE5EB] cursor-pointer' : ''}`}
        onClick={!editMode && onToggleSelect ? onToggleSelect : undefined}
      >
        {/* Header: ID + Title + Priority */}
        <div className="flex justify-between items-start w-full">
          <div className="flex gap-3 items-start flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
            <div className="flex items-center gap-2">
              <span className={styles.badge}>{idTitle}</span>
            </div>
            <span className={styles.title}>{title}</span>
          </div>

          
        </div>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* Edit or Select indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          
          <span className={`text-sm px-2 py-1 rounded-full ${
            priority === 'High' ? 'bg-[#C29BB3] text-black' :
            priority === 'Medium' ? 'bg-[#EBD8E4] text-black' :
            'bg-[#E6EDF0] text-black'
          }`}>
            {priority}
          </span>
          
          {editMode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenEdit(true);
              }}
              aria-label="Edit requirement"
            >
              <Pencil size={16} className="text-[#4A2B4A]" />
            </button>
          ) : (
            isSelected ? (
              <Check size={16} className={`${styles.icon} bg-[#4A2B4A] text-white rounded-full`} />
            ) : (
              <Circle size={16} className={styles.icon} />
            )
          )}
        </div>
      </div>


      <RequirementEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        requirement={{ id, uuid, idTitle, title, description, priority, category }}
        onSave={(updated) => {
          onUpdate(updated);
          setOpenEdit(false);
        }}
        onDelete={(deletedUuid) => {
          onDelete(deletedUuid);
          setOpenEdit(false);
        }}
      />
    </>
  );
};

export default  RequirementCard;