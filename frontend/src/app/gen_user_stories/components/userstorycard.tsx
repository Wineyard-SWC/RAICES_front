'use client';

import { endpointClientChangedSubscribe } from 'next/dist/build/swc/generated-native';
import { UserStory } from '../../../types/userstory';
import { userStoryCardStyles as styles } from '../styles/userstory.module';
import UserStoryEditModal from './userstoryeditmodal';
import { CheckCircle, Plus, Pencil, Check, Circle} from 'lucide-react';
import React, {useState} from 'react';


type Props = Pick<UserStory,
    | 'uuid'
    | 'id'
    | 'idTitle'
    | 'title'
    | 'description'
    | 'priority'
    | 'acceptance_criteria'
    | 'assigned_epic'
    | 'points'
> & {
  editMode?:boolean;
  onUpdate: (updated:UserStory)=>void;
  availableEpics:{ uuid: string; id: string; title: string }[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete: (uuid: string) => void;
};

const UserStoryCard = ({
    uuid,
    id,
    assigned_epic,
    idTitle,
    title,
    description,
    priority,
    acceptance_criteria,
    points,
    editMode,
    onUpdate,
    availableEpics,
    onToggleSelect,
    isSelected,
    onDelete,

}: Props) => {
    const [openEdit, setOpenEdit] = useState(false);

    return (
      <>
        <div 
          className={`${styles.wrapper} ${!editMode ? 'hover:bg-[#EBE5EB] cursor-pointer' : ''}`}
          onClick={!editMode && onToggleSelect ? onToggleSelect : undefined}
        >
          <div className={styles.header}>
            <div className={styles.leftHeader}>
              <span className={`${styles.badge} ${styles.badgeID}`}>{idTitle}</span>
              <span className={`${styles.badge} ${styles.badgePriority[priority]}`}>{priority}</span>
            </div>
            
            {editMode && (
              <button
                className={styles.plusIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenEdit(true);
                }}
                aria-label="Edit"
              >
                <Pencil size={16} />
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
    
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
    
          <div>
            <p className={styles.acceptanceTitle}>Acceptance Criteria:</p>
            <ul className="space-y-1 mt-1">
              {acceptance_criteria?.map((criterion, index) => (
                <li key={index} className={styles.acceptanceItem}>
                  <CheckCircle size={14} className={styles.icon} />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <UserStoryEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        userStory={{
          uuid,
          id,
          idTitle,
          title,
          description,
          priority,
          acceptance_criteria,
          assigned_epic,
          points
        }}
        availableEpics={availableEpics}
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
    
export default UserStoryCard;