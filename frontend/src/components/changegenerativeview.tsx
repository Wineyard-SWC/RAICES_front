'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { projectInputStyles as input } from '@/app/gen_requirements/styles/projectinput.module';
import { FileText, Layers, Book } from 'lucide-react';

const tabs = [
  { label: 'Requirements', href: '/gen_requirements', icon: <FileText className="w-5 h-5" />},
  { label: 'Epics', href: '/gen_epics',  icon: <Layers className="w-5 h-5" /> },
  { label: 'User Stories', href: '/gen_user_stories', icon: <Book className="w-5 h-5" /> },
];

export const FlowTabs = ({ currentPath, onTabChange, isLoading }) => {
  const pathname = currentPath || usePathname();

  return (
    <div className="w-full flex border border-[#4a2b4a] divide-x divide-[#4a2b4a] rounded-lg overflow-hidden mb-6">
      {tabs.map((tab) => (
        <Link href={tab.href} key={tab.label} className="flex-1">
          <button
            className={pathname === tab.href ? input.tabActive : input.tabInactive}
            style={{ 
              width: '100%', 
              borderRadius: 0,
              padding: '0.75rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRight: 'none' 
            }}
            onClick={() => onTabChange && onTabChange(tab.href)}
            disabled={isLoading}
          >
            <span className="text-lg">{tab.icon}</span> {tab.label}
          </button>
        </Link>
      ))}
    </div>
  );
};

