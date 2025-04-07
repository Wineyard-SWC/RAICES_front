'use client';

import EpicCard from './components/epiccard';
import { Epic } from '@/types/epic';
import { reqInputStyles as input } from "./styles/reqinput.module";
import { epicCardStyles as gen } from "./styles/epic.module";
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

    <div className="min-h-screen bg-[#EBE5EB] p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
      <div className={input.wrapper}>
                <h2 className={input.title}>📱 Requirements Input</h2>
      
                <div className={input.tabs}>
                  <button className={input.tabInactive}>📄 Requirements</button>
                  <button className={input.tabActive}>📦 Epics</button>
                  <button className={input.tabInactive}>📖 User Stories</button>
                </div>
      
                <label className={input.label}>Project Requirements</label>
                <textarea
                  className={input.textarea}
                  placeholder="Enter your project requirements, one per line, for example:
                  REQ-1:   The system shall provide user authentication
                  REQ-2: The system shall allow users to create and manage sprints.."
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                />
      
                <div className={input.actions}>
                  <button className={input.generateButton}>Generate Requirements</button>
                  <button className={input.clearButton} onClick={() => setReqDescription('')}>Clear</button>
                </div>
              </div>

        <EpicCard {...Epic} />

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