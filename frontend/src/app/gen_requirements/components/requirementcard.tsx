'use client';

import { Requirement } from "@/types/requirement";
import { CheckCircle } from 'lucide-react'; 
import { requirementCardStyles as styles} from "../styles/requirement.module";
import React from 'react';

type Props = Pick<Requirement,
    | 'id'
    | 'title'
    | 'idTitle'
    | 'description'
    | 'priority'
>;

const RequirementCard = ({
    id,
    idTitle,
    title,
    description,
    priority
}: Props) =>{
   return (
    <div className={styles.wrapper}>
      <CheckCircle size={18} className={styles.icon} />
      
      <div className="flex flex-col">
        
        <div className="flex items-center space-x-3">
          <span className={styles.badge}>{idTitle}</span>
          <span className={styles.title}>{title}</span>
        </div>

        
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default  RequirementCard;