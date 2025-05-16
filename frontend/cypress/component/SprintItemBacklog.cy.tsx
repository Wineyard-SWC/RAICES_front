import React from 'react'
import ProductBacklog from '@/app/sprint_planning/components/ProductBacklog'
import type { SprintUserStory } from '@/types/sprint'

describe('ProductBacklog.cy.tsx', () => {
  // Dummy data matching SprintUserStory shape
  const dummyStory = {
    id: '1',
    userStory: {
      title: 'Test Story',
      description: 'A test description',
      priority: 'High',
    },
    tasks: [],
  }

  // Wrapper to manage selection state
  function TestComponent() {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const userStories: SprintUserStory[] = [
      {
        ...dummyStory,
        selected: selectedIds.includes(dummyStory.id),
      },
    ]
    const handleToggle = (id: string) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      )
    }
    return (
      <ProductBacklog
        userStories={userStories}
        onToggleUserStory={handleToggle}
      />
    )
  }

  it('should toggle Add and Remove when clicking the button', () => {
    cy.mount(<TestComponent />)

    // Initially, button shows "Add"
    cy.contains('button', 'Add').should('be.visible')

    // Click to add: it should change to "Remove"
    cy.contains('button', 'Add').click()
    cy.contains('button', 'Remove').should('be.visible')

    // Click to remove: it should change back to "Add"
    cy.contains('button', 'Remove').click()
    cy.contains('button', 'Add').should('be.visible')
  })
})
