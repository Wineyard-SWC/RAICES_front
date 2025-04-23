'use client';

import { EpicWithUserStories } from '@/types/epicwithuserstories';
import { epicUserStoryGroupStyles as styles } from '../styles/epicwithuserstories.module';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import UserStoryCard from './userstorycard';
import { UserStory } from '@/types/userstory';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';

type Props = {
  uuid: string;
  id: string;
  idTitle: string;
  userStories: UserStory[];
  editMode?: boolean;
  onUpdate: (updated: UserStory) => void;
  availableEpics: {uuid: string, id: string; title: string }[];
  onDelete:  (uuid: string) => void;
};

const EpicUserStoryGroup = ({
  uuid,
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

  const toggleSelectStory = (uuid: string) => {
    setSelectedUserStoriesIds((prev) =>
      prev.includes(uuid) ? prev.filter((s) => s !== uuid) : [...prev, uuid]
    );
  };

  const handleDelete = (storyUuid: string) => {
    setSelectedUserStoriesIds((prev) => prev.filter((uuid) => uuid !== storyUuid));
    
    if (onDelete) {
      onDelete(storyUuid);
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
            key={story.uuid}
            {...story}
            onUpdate={onUpdate}
            editMode={editMode}
            isSelected={selectedUserStoriesIds.includes(story.uuid)}
            onToggleSelect={() => toggleSelectStory(story.uuid)}
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