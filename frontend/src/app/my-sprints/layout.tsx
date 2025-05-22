import { SprintProvider } from "@/contexts/sprintcontext"

export default function SprintsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SprintProvider>
      {children}
    </SprintProvider>
  )
}