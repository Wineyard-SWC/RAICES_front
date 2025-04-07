'use client';

import EpicUserStoryGroup from './components/epicwithuserstoriescard';
import { EpicWithUserStories } from '@/types/epicwithuserstories';
import { epicInputStyles as input } from "./styles/epicinput.module";
import { useState } from 'react';


export default function UserStoriesPage() {
  console.log('UserStoriesPage rendered');

  const [epicDescription, setEpicDescription] = useState('');

    const mockGroup: EpicWithUserStories = {
        id: 1,
        idTitle: 'EPIC-001',
        userStories: [
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
          },
          {
            id: '2',
            idTitle: 'US-002',
            title: 'User Login',
            description: 'As a user, I want to log in so I can access my dashboard',
            priority: 'High',
            points: 3,
            acceptanceCriteria: ['User can log in with email and password'],
          },
        ],
      };

  return (
    <div className="min-h-screen bg-[#EBE5EB] p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
          <div className={input.wrapper}>
                    <h2 className={input.title}>📱 Epics Input</h2>
          
                    <div className={input.tabs}>
                      <button className={input.tabInactive}>📄 Requirements</button>
                      <button className={input.tabInactive}>📦 Epics</button>
                      <button className={input.tabActive}>📖 User Stories</button>
                    </div>
          
                    <label className={input.label}>Epics</label>
                    <textarea
                      className={input.textarea}
                      placeholder="Enter your epics, one per section. For example:
                      EPIC-1: User Authentication and Authorization Implement secure user authentication and role-based access control.
                      EPIC-2: Sprint Management
                      Create functionality for managing sprints, including creation and tracking."
                      value={epicDescription}
                      onChange={(e) => setEpicDescription(e.target.value)}
                    />
          
                    <div className={input.actions}>
                      <button className={input.generateButton}>Generate Requirements</button>
                      <button className={input.clearButton} onClick={() => setEpicDescription('')}>Clear</button>
                    </div>
                  </div>

        <EpicUserStoryGroup {...mockGroup} />
      </div>
    </div>
  );
}
