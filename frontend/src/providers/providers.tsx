import type React from "react"
import type { ReactNode } from "react"
import { UserProvider } from "@/contexts/usercontext"
import { RequirementProvider } from "@/contexts/requirementcontext"
import { EpicProvider } from "@/contexts/epiccontext"
import { UserStoryProvider } from "@/contexts/userstorycontext"
import { ProjectProvider } from "@/contexts/projectcontext"
import { SessionProvider } from "@/contexts/sessioncontext"
import { SelectedRequirementProvider } from "@/contexts/selectedrequirements"
import { SelectedEpicProvider } from "@/contexts/selectedepics"
import { SelectedUserStoriesProvider } from "@/contexts/selecteduserstories"
import { LanguageProvider } from "@/contexts/languagecontext"
import { TaskProvider } from "@/contexts/taskcontext"
import { SprintProvider } from "@/contexts/sprintcontext"
import { BacklogProvider } from "@/contexts/backlogcontext"
import { SprintDataProvider } from "@/contexts/sprintdatacontext"

interface ProvidersProps {
  children: ReactNode
}

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <ProjectProvider>
          <RequirementProvider>
            <EpicProvider>
              <UserStoryProvider>
                <TaskProvider>
                  <SprintProvider>        
                    <SelectedRequirementProvider>
                      <SelectedEpicProvider>
                        <SelectedUserStoriesProvider>
                          <LanguageProvider>
                            <BacklogProvider>
                              <SprintDataProvider>
                                {children}
                                <div id="modal-root" />
                              </SprintDataProvider>
                            </BacklogProvider>
                          </LanguageProvider>
                        </SelectedUserStoriesProvider>
                      </SelectedEpicProvider>
                    </SelectedRequirementProvider>
                  </SprintProvider>     
                </TaskProvider>
              </UserStoryProvider>
            </EpicProvider>
          </RequirementProvider>
        </ProjectProvider>
      </UserProvider>
    </SessionProvider>
  )
}
