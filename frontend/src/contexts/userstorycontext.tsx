'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { UserStory } from '@/types/userstory';

type UserStoryContextType = {
  userStories: UserStory[];
  setUserStories: React.Dispatch<React.SetStateAction<UserStory[]>>
};

const UserStoryContext = createContext<UserStoryContextType | undefined>(undefined);

export const UserStoryProvider = ({ children }: { children: ReactNode }) => {
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  return (
    <UserStoryContext.Provider value={{ userStories, setUserStories }}>
      {children}
    </UserStoryContext.Provider>
  );
};

export const useUserStoryContext = () => {
  const context = useContext(UserStoryContext);
  if (!context) throw new Error('useEpicContext must be used within EpicProvider');
  return context;
};
