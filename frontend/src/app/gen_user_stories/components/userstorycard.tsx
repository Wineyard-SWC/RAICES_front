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
    | 'acceptanceCriteria'
    | 'assigned_epic'
    | 'points'
    | 'completed_acceptanceCriteria'
    | 'total_acceptanceCriteria'
>& {
  editMode?:boolean;
  onUpdate: (updated:UserStory)=>void;
  availableEpics:{ uuid: string; id: string; title: string }[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete: (uuid: string) => void;
  onUpdateWithToast?: () => void;
};

const UserStoryCard = ({
  uuid,
  id,
  assigned_epic,
  idTitle,
  title,
  description,
  priority,
  acceptanceCriteria,
  points,
  completed_acceptanceCriteria,
  total_acceptanceCriteria,
  editMode,
  onUpdate,
  availableEpics,
  onToggleSelect,
  isSelected,
  onDelete,
  onUpdateWithToast

}: Props) => {
    const [openEdit, setOpenEdit] = useState(false);


    const completedCriteria = completed_acceptanceCriteria !== undefined 
        ? completed_acceptanceCriteria 
        : acceptanceCriteria?.filter(ac => ac.date_completed).length || 0;
    
    const totalCriteria = total_acceptanceCriteria !== undefined
        ? total_acceptanceCriteria
        : acceptanceCriteria?.length || 0;

    const completionPercentage = totalCriteria > 0 
        ? Math.round((completedCriteria / totalCriteria) * 100) 
        : 0;

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
              {points > 0 && (
                <span className={`${styles.badge} bg-gray-200 text-gray-800`}>{points} {points === 1 ? 'point' : 'points'}</span>
              )}
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
    
          {acceptanceCriteria && acceptanceCriteria.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className={styles.acceptanceTitle}>Acceptance Criteria:</p>
                <span className="text-sm text-gray-600">
                  {completedCriteria}/{totalCriteria} completed
                </span>
              </div>
              
              {/* Barra de progreso para criterios completados */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              
              <ul className="space-y-1 mt-1">
                {acceptanceCriteria.slice(0, 3).map((criterion, index) => (
                  <li key={index} className={`${styles.acceptanceItem} ${criterion.date_completed ? 'text-gray-500' : ''}`}>
                    {criterion.date_completed ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} className={styles.icon} />
                    )}
                    <span>{criterion.description}</span>
                  </li>
                ))}
                
                {acceptanceCriteria.length > 3 && (
                  <li className="text-sm text-gray-500 pl-5">
                    + {acceptanceCriteria.length - 3} more criteria
                  </li>
                )}
              </ul>
            </div>
          )}
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
            acceptanceCriteria: acceptanceCriteria || [],
            assigned_epic,
            points,
            completed_acceptanceCriteria,
            total_acceptanceCriteria
        }}
        availableEpics={availableEpics}
        onSave={(updated) => {
          onUpdate(updated);
          setOpenEdit(false);
          onUpdateWithToast?.();
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