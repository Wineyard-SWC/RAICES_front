'use client';

import RequirementCard from './components/requirementcard';
import { Requirement } from '@/types/requirement';
import { projectInputStyles as input } from "./styles/projectinput.module";
import { generatedReqStyles as gen } from "./styles/genreq.module";
import { useState } from 'react';

export default function RequirementsPage() {
  const [projectDescription, setProjectDescription] = useState('');

  const mockRequirements: Requirement[] = [
    {
      id: "1",
      idTitle: "1",
      title: 'User Authentication',
      description: 'The system shall provide user authentication with role-based access control.',
      priority: 'High',
    },
    {
      id: "2",
      idTitle: "2",
      title: 'Data Export',
      description: 'The system shall allow users to export their data in CSV format.',
      priority: 'Medium',
    },
    {
      id: "1",
      idTitle: "3",
      title: 'Offline Mode',
      description: 'The system shall support offline functionality for core features.',
      priority: 'Low',
    },
  ];

  return (
    <div className="min-h-screen bg-[#EBE5EB] p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">

        
        <div className={input.wrapper}>
          <h2 className={input.title}>📱 Project Input</h2>

          <div className={input.tabs}>
            <button className={input.tabActive}>📄 Requirements</button>
            <button className={input.tabInactive}>📦 Epics</button>
            <button className={input.tabInactive}>📖 User Stories</button>
          </div>

          <label className={input.label}>Project's Description</label>
          <textarea
            className={input.textarea}
            placeholder="Describe your project goals, target users, key features and any specific requirements you already know…"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />

          <div className={input.actions}>
            <button className={input.generateButton}>Generate Requirements</button>
            <button className={input.clearButton}>Clear</button>
          </div>
        </div>

        
        <div className={gen.wrapper}>
          <div className={gen.header}>
            <h2 className={gen.title}>Generated requirements</h2>
            <div className={gen.viewToggle}>
              <button className={gen.viewActive}>List View</button>
              <button className={gen.viewInactive}>Edit View</button>
            </div>
          </div>

          <div className={gen.list}>
            {mockRequirements.map((req) => (
              <RequirementCard
                key={req.id}
                id={req.id}
                idTitle={`REQ-${req.idTitle}`}
                title={req.title}
                description={req.description}
                priority={req.priority}
              />
            ))}
          </div>

          <div className={gen.actions}>
            <button className={gen.button}>📋 Copy all</button>
            <button className={gen.button}>⬇️ Export</button>
            <button className={gen.button}>🔄 Regenerate</button>
          </div>
        </div>
      </div>
    </div>
  ); 
}