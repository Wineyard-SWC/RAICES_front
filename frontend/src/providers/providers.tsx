'use client' // Add this line to make it a client component

import type React from "react"
import type { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { UserProvider } from "@/contexts/usercontext"
import { RequirementProvider } from "@/contexts/requirementcontext"
import { EpicProvider } from "@/contexts/epiccontext"
import { UserStoryProvider } from "@/contexts/userstorycontext"
import { ProjectProvider } from "@/contexts/projectcontext"
import { SelectedRequirementProvider } from "@/contexts/selectedrequirements"
import { SelectedEpicProvider } from "@/contexts/selectedepics"
import { SelectedUserStoriesProvider } from "@/contexts/selecteduserstories"
import { LanguageProvider } from "@/contexts/languagecontext"
import { TaskProvider } from "@/contexts/taskcontext"
import { SprintProvider } from "@/contexts/sprintcontext"
import { SprintDataProvider } from "@/contexts/sprintdatacontext"
import { UserStoryProvider as SavedUserStoryProvider } from "@/contexts/saveduserstoriescontext"
import { AssignmentProvider } from "@/contexts/userstoriesepicsrelationshipcontext"
import { GeneratedTasksProvider } from "@/contexts/generatedtaskscontext"
import { BugProvider } from "@/contexts/bugscontext"
import { TeamsProvider } from "@/contexts/teamscontext"
import { AvatarProvider } from "@/contexts/AvatarContext"
import { UserRolesProvider } from "@/contexts/userRolesContext"
import { KanbanProvider } from "@/contexts/unifieddashboardcontext"
import { ProjectUsersProvider } from "@/contexts/ProjectusersContext"
import { UserPermissionsProvider } from "@/contexts/UserPermissions"
import { CalendarProvider } from "@/contexts/CalendarContext"
import { GenerativeAISessionProvider } from "@/contexts/generativeaisessioncontext"

interface ProvidersProps {
  children: ReactNode
}

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GenerativeAISessionProvider>
        <UserProvider>
          <AvatarProvider>
            <UserRolesProvider>
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
                                          <BugProvider>
                                            <KanbanProvider>
                                              <TeamsProvider>
                                                <ProjectUsersProvider>
                                                  <UserPermissionsProvider>
                                                    <CalendarProvider>
                                                      {children}
                                                      <div id="modal-root" />
                                                    </CalendarProvider>
                                                  </UserPermissionsProvider>
                                                </ProjectUsersProvider>
                                              </TeamsProvider>
                                            </KanbanProvider>
                                          </BugProvider>
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
      </GenerativeAISessionProvider>
    </SessionProvider>
  )
}
