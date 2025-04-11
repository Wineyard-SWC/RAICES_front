'use client';

import { EpicWithUserStories } from '@/types/epicwithuserstories';
import { epicUserStoryGroupStyles as styles } from '../styles/epicwithuserstories.module';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import UserStoryCard from './userstorycard';
import { UserStory } from '@/types/userstory';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';

type Props = {
  id: string;
  idTitle: string;
  userStories: UserStory[];
  editMode?: boolean;
  onUpdate: (updated: UserStory) => void;
  availableEpics: string[];
  onDelete:  (id: string) => void;
};

const EpicUserStoryGroup = ({
  id,
  idTitle,
  userStories,
  editMode = false,
  onUpdate,
  availableEpics,
  onDelete,
}: Props) => {
  const [expanded, setExpanded] = useState(true);
  
  const { selectedUserStoriesIds, setSelectedUserStoriesIds } = useSelectedUserStoriesContext();

  const toggleSelectStory = (id: string) => {
    setSelectedUserStoriesIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDelete = (storyId: string) => {
    setSelectedUserStoriesIds((prev) => prev.filter((id) => id !== storyId));
    
    if (onDelete) {
      onDelete(storyId);
    }
  };

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
          {userStories?.map((story) => (
            <UserStoryCard
            key={story.id}
            {...story}
            onUpdate={onUpdate}
            editMode={editMode}
            isSelected={selectedUserStoriesIds.includes(story.id)}
            onToggleSelect={() => toggleSelectStory(story.id)}
            availableEpics={availableEpics}
            onDelete={handleDelete}
           />
          ))}
        </div>
      )}
    </div>
  );
};

export default EpicUserStoryGroup;