'use client';

import { Requirement } from "@/types/requirement";
import { CheckCircle, Pencil } from 'lucide-react'; 
import { requirementCardStyles as styles} from "../styles/requirement.module";
import React, {useState} from 'react';
import RequirementEditModal from "./requirementeditmodal";

type Props = Pick<Requirement, 'id' | 'idTitle' | 'title' | 'description' | 'priority'> & {
  onUpdate: (updated: Requirement) => void;
  editMode?: boolean;
};

const RequirementCard = ({
    id,
    idTitle,
    title,
    description,
    priority,
    onUpdate,
    editMode
}: Props) =>{
  const [openEdit, setOpenEdit] = useState(false)
  

   return (
    <>
      <div className={styles.wrapper}>
        <CheckCircle size={18} className={styles.icon} />
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <span className={styles.badge}>{idTitle}</span>
              <span className={styles.title}>{title}</span>
            </div>
            {editMode && (
              <button onClick={() => setOpenEdit(true)} aria-label="Edit requirement">
                <Pencil size={16} className="text-[#4A2B4A]" />
              </button>
            )}
          </div>
          <p className={styles.description}>{description}</p>
        </div>
      </div>

      <RequirementEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        requirement={{ id, idTitle, title, description, priority }}
        onSave={(updated) => {
          onUpdate(updated);
          setOpenEdit(false);
        }}
      />
    </>
  );
};

export default  RequirementCard;