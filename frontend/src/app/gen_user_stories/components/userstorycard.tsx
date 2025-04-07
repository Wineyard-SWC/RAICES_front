'use client';

import { endpointClientChangedSubscribe } from 'next/dist/build/swc/generated-native';
import { UserStory } from '../../../types/userstory';
import { userStoryCardStyles as styles } from '../styles/userstory.module';
import UserStoryEditModal from './userstoryeditmodal';
import { CheckCircle, Plus, Pencil} from 'lucide-react';
import React, {useState} from 'react';


type Props = Pick<UserStory,
    | 'id'
    | 'idTitle'
    | 'title'
    | 'description'
    | 'priority'
    | 'acceptanceCriteria'
    | 'epicId'
    | 'points'
> & {
  editMode?:boolean;
  onUpdate: (updated:UserStory)=>void;
  availableEpics:string[];
};

const UserStoryCard = ({
    id,
    idTitle,
    title,
    description,
    priority,
    acceptanceCriteria,
    epicId,
    points,
    editMode,
    onUpdate,
    availableEpics

}: Props) => {
    const [openEdit, setOpenEdit] = useState(false);

    return (
      <>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.leftHeader}>
              <span className={`${styles.badge} ${styles.badgeID}`}>{idTitle}</span>
              <span className={`${styles.badge} ${styles.badgePriority[priority]}`}>{priority}</span>
            </div>
            
            {editMode && (
            <button 
              className={styles.plusIcon} onClick={() => setOpenEdit(true)}
              aria-label="Edit"
              >
              <Pencil size={16} />
            </button>
            )}

          </div>
    
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
    
          <div>
            <p className={styles.acceptanceTitle}>Acceptance Criteria:</p>
            <ul className="space-y-1 mt-1">
              {acceptanceCriteria.map((criterion, index) => (
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
          id,
          idTitle,
          title,
          description,
          priority,
          acceptanceCriteria,
          epicId,
          points
        }}
        availableEpics={availableEpics}
        onSave={(updated) => {
          onUpdate(updated);
          setOpenEdit(false);
        }}
      />
     </>
    );
};
    
export default UserStoryCard;