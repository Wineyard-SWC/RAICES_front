'use client';

import EpicCard from './components/epiccard';
import { Epic } from '@/types/epic';
import { useState } from 'react';


export default function EpicsPage() {
  const [epic, setEpic] = useState<Pick<Epic, 'id' | 'idTitle' | 'title' | 'description' | 'relatedRequirements'>>({
    id: 1,
    idTitle: "001",
    title: 'User Authentication and Authorization',
    description:
      'Implement secure user authentication and role-based access control for the sprint planning platform',
    relatedRequirements: [
      {
        idTitle: 'REQ-001',
        title: 'REQ-001',
        description:
          'The system shall provide user authentication and authorization with role-based access control.',
      },
      {
        idTitle: 'REQ-002',
        title: 'REQ-002',
        description:
          'The system shall enable team collaboration with commenting and notification features.',
      },
    ],
  });

  return (
    <div className="min-h-screen bg-[#EBE5EB] flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <EpicCard
          {...epic}
          editMode={true}
          onUpdate={(updated) => setEpic(updated)}
        />
      </div>
    </div>
  );
}