import { ReactNode } from 'react';
import { UserProvider } from '@/contexts/usercontext';
import { RequirementProvider } from "@/contexts/requirementcontext";
import { EpicProvider } from "@/contexts/epiccontext";
import { UserStoryProvider } from "@/contexts/userstorycontext";
import { ProjectProvider } from "@/contexts/projectcontext";
import { SessionProvider } from "@/contexts/sessioncontext";
import { SelectedRequirementProvider } from "@/contexts/selectedrequirements";
import { SelectedEpicProvider } from "@/contexts/selectedepics";
import { SelectedUserStoriesProvider } from "@/contexts/selecteduserstories";
import { LanguageProvider } from '@/contexts/languagecontext';

interface ProvidersProps {
  children: ReactNode;
}

export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <RequirementProvider>
      <EpicProvider>
        <UserStoryProvider>
          <ProjectProvider>
            <SessionProvider>
              <SelectedRequirementProvider>
                <SelectedEpicProvider>
                  <SelectedUserStoriesProvider>
                    <UserProvider>
                      <LanguageProvider>
                        {children}
                        <div id="modal-root" />
                      </LanguageProvider>
                    </UserProvider>
                  </SelectedUserStoriesProvider>
                </SelectedEpicProvider>
              </SelectedRequirementProvider>
            </SessionProvider>
          </ProjectProvider>
          </UserStoryProvider>
        </EpicProvider>
    </RequirementProvider>
  );
}