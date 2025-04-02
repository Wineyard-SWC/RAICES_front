'use client';

import { UserStory } from '../../../types/userstory';
import { userStoryCardStyles as styles } from '../styles/userstory.module';
import { CheckCircle, Plus } from 'lucide-react';
import React from 'react';


type Props = Pick<UserStory,
    | 'id'
    | 'idTitle'
    | 'title'
    | 'description'
    | 'priority'
    | 'acceptanceCriteria'
>;

const UserStoryCard = ({
    id,
    idTitle,
    title,
    description,
    priority,
    acceptanceCriteria
}: Props) => {
    return (
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.leftHeader}>
              <span className={`${styles.badge} ${styles.badgeID}`}>{idTitle}</span>
              <span className={`${styles.badge} ${styles.badgePriority[priority]}`}>{priority}</span>
            </div>
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
    );
};
    
export default UserStoryCard;