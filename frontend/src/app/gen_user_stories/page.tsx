'use client';

import EpicUserStoryGroup from './components/epicwithuserstoriescard';
import { EpicWithUserStories } from '@/types/epicwithuserstories';


export default function UserStoriesPage() {
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
    <div className="min-h-screen bg-[#EBE5EB] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <EpicUserStoryGroup {...mockGroup} />
      </div>
    </div>
  );
}
