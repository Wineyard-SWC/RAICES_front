'use client';

import { Requirement } from "@/types/requirement";
import { CheckCircle } from 'lucide-react'; 
import { requirementCardStyles as styles} from "../styles/requirement.module";
import React from 'react';

type Props = Pick<Requirement,
    | 'id'
    | 'title'
    | 'description'
    | 'priority'
>;

const RequirementCard = ({
    id,
    title,
    description,
    priority
}: Props) =>{
    return (
        <div className={styles.wrapper}>
          <CheckCircle size={16} className={styles.icon} />
          <div>
            <span className={styles.badge}>{id}</span>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
    );
};

export default  RequirementCard;