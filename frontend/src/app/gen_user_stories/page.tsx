'use client';

import EpicUserStoryGroup from './components/epicwithuserstoriescard';
import { UserStory } from '@/types/userstory';
import { useState } from 'react';

export default function UserStoriesPage() {
  const initialStories: UserStory[] = [
    {
      id: '1',
      idTitle: 'US-001',
      title: 'User Registration',
      description: 'As a new user, I want to register for an account...',
      priority: 'High',
      points: 5,
      acceptanceCriteria: [
        'User can register with email and password',
        'User can reset forgotten password',
      ],
      epicId: 'EPIC-001',
    },
    {
      id: '2',
      idTitle: 'US-002',
      title: 'User Login',
      description: 'As a user, I want to log in so I can access my dashboard',
      priority: 'High',
      points: 3,
      acceptanceCriteria: ['User can log in with email and password'],
      epicId: 'EPIC-001',
    },
  ];

  const groupByEpic = (stories: UserStory[]) => {
    const groups: Record<string, UserStory[]> = {};
    for (const story of stories) {
      if (!groups[story.epicId]) groups[story.epicId] = [];
      groups[story.epicId].push(story);
    }
    return groups;
  };

  const [epicMap, setEpicMap] = useState(groupByEpic(initialStories));
  const [editMode, setEditMode] = useState(true);

  const allEpicIds = Object.keys(epicMap);

  const handleUpdateStory = (updated: UserStory) => {
    setEpicMap((prev) => {
      const newMap = { ...prev };

      for (const epicId in newMap) {
        newMap[epicId] = newMap[epicId].filter((s) => s.id !== updated.id);
      }

      if (!newMap[updated.epicId]) {
        newMap[updated.epicId] = [];
      }

      newMap[updated.epicId].push(updated);

      return newMap;
    });
  };

  return (
    <div className="min-h-screen bg-[#EBE5EB] flex flex-col items-center justify-start p-6 space-y-6">
      <div className="max-w-4xl w-full space-y-6">
        {Object.entries(epicMap).map(([epicId, stories]) => (
          <EpicUserStoryGroup
            key={epicId}
            id={epicId}
            idTitle={epicId}
            userStories={stories}
            editMode={editMode}
            onUpdate={handleUpdateStory}
            availableEpics={allEpicIds}
          />
        ))}
      </div>
    </div>
  );
}
