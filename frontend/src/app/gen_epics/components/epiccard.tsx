'use client';

import { Epic } from '@/types/epic';
import { epicCardStyles as styles } from '../styles/epic.module';
import { CheckCircle, Plus } from 'lucide-react';
import React from 'react';


type Props = Pick<Epic,
    | 'id'
    | 'title'
    | 'idTitle'
    | 'description'
    | 'relatedRequirements'
>;


const EpicCard = ({
    id,
    idTitle,
    title,
    description,
    relatedRequirements
}: Props) =>{
    return (
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div>
              <span className={styles.badge}>{`EPIC-${idTitle.toString().padStart(2, '0')}`}</span>
              <span className={styles.title}>{title}</span>
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
    );
}


export default EpicCard