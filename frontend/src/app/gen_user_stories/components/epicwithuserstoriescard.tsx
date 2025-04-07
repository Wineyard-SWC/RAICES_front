'use client';

import { EpicWithUserStories } from '@/types/epicwithuserstories';
import { epicUserStoryGroupStyles as styles } from '../styles/epicwithuserstories.module';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import UserStoryCard from './userstorycard';
import { UserStory } from '@/types/userstory';



type Props = {
  id: string;
  idTitle: string;
  userStories: UserStory[];
  editMode?: boolean;
  onUpdate: (updated: UserStory) => void;
  availableEpics: string[];
};

const EpicUserStoryGroup = ({
  id,
  idTitle,
  userStories,
  editMode = false,
  onUpdate,
  availableEpics
}: Props) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className="flex items-center">
          <span className={styles.badge}>{idTitle}</span>
          <span className={styles.title}>{userStories.length} User Stories</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className={styles.toggleIcon}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className={styles.list}>
          {userStories.map((story) => (
            <UserStoryCard
            key={story.id}
            {...story}
            onUpdate={onUpdate}
            editMode={editMode}
            availableEpics={availableEpics}
           />
          ))}
        </div>
      )}
    </div>
  );
};

export default EpicUserStoryGroup;