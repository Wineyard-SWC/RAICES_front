'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { projectInputStyles as input } from '@/app/gen_requirements/styles/projectinput.module';

const tabs = [
  { label: 'Requirements', href: '/gen_requirements', icon: '📄' },
  { label: 'Epics', href: '/gen_epics', icon: '📦' },
  { label: 'User Stories', href: '/gen_user_stories', icon: '📖' },
];

export const FlowTabs = ({ currentPath, onTabChange }) => {
  const pathname = currentPath || usePathname();

  return (
    <div className="w-full flex border rounded-lg overflow-hidden mb-6">
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
          >
            <span className="text-lg">{tab.icon}</span> {tab.label}
          </button>
        </Link>
      ))}
    </div>
  );
};

