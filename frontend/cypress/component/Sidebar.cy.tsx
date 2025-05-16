import React, { useState } from 'react'
import type { Sprint } from '@/types/sprint'
import { mount } from 'cypress/react'
import SprintSidebar from '@/app/sprint_planning/components/SprintSidebar'

describe('SprintSidebar.cy.tsx', () => {
  const baseSprint: Sprint & { project_id?: string; max_points?: number } = {
    id: '1',
    project_id: 'proj1',
    name: 'Sprint 1',
    duration_weeks: 2,
    start_date: '2025-05-01T00:00:00.000Z',
    end_date:   '2025-05-15T00:00:00.000Z',
    user_stories: [],
    team_members: [],
    max_points: 20,
  }

  // Wrapper to control open state
  function TestWrapper() {
    const [open, setOpen] = useState(false)
    // onSave returns a resolved promise to satisfy the prop
    const onSave = () => Promise.resolve(null)
    return (
      <SprintSidebar
        sprint={baseSprint}
        isOpen={open}
        onToggle={() => setOpen(o => !o)}
        onSave={onSave}
      />
    )
  }

  beforeEach(() => {
    mount(<TestWrapper />)
  })

  it('togglea el sidebar y muestra campos al abrirse', () => {
    cy.contains('Sprint Summary').should('not.exist')

    cy.get('button').first().click()

    cy.contains('Sprint Summary').should('be.visible')

    cy.contains('Sprint Details').should('be.visible')
    cy.contains('Name:')
      .siblings('span')
      .should('contain.text', baseSprint.name)

    cy.contains('Duration').siblings('span').should('contain.text', `${baseSprint.duration_weeks} weeks`)

    cy.contains('Team Size').siblings('span').should('contain.text', '0 members')

    cy.get('button').first().click()
    cy.contains('Sprint Summary').should('not.exist')
  })
})
