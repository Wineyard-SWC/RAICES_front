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
import { SprintDataProvider } from "@/contexts/sprintdatacontext"
import { UserStoryProvider  as SavedUserStoryProvider} from "@/contexts/saveduserstoriescontext"
import { AssignmentProvider } from "@/contexts/userstoriesepicsrelationshipcontext"
import { GeneratedTasksProvider } from "@/contexts/generatedtaskscontext"
import { KanbanProvider } from "@/contexts/unifieddashboardcontext"
import { AvatarProvider } from "@/contexts/AvatarContext"
import { UserRolesProvider } from "@/contexts/userRolesContext" // Nueva importación

interface ProvidersProps {
  children: ReactNode
}

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <AvatarProvider>
          <UserRolesProvider> {/* Añadir el nuevo provider */}
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
                                  <SprintDataProvider>
                                    <SavedUserStoryProvider>
                                      <AssignmentProvider>
                                        <GeneratedTasksProvider>
                                          <KanbanProvider>
                                            {children}
                                            <div id="modal-root" />
                                          </KanbanProvider>
                                        </GeneratedTasksProvider>
                                      </AssignmentProvider>
                                    </SavedUserStoryProvider>
                                  </SprintDataProvider>
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
          </UserRolesProvider>
        </AvatarProvider>
      </UserProvider>
    </SessionProvider>
  )
}