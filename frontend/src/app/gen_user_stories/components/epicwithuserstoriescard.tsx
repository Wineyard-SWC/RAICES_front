'use client';

import { EpicWithUserStories } from '@/types/epicwithuserstories';
import { epicUserStoryGroupStyles as styles } from '../styles/epicwithuserstories.module';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import UserStoryCard from './userstorycard';

type Props = EpicWithUserStories;

const EpicUserStoryGroup = ({ id, idTitle, userStories }: Props) => {
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
            <UserStoryCard key={story.id} {...story} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EpicUserStoryGroup;