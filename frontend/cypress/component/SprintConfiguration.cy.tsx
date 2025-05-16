import React from 'react'
import type { Sprint } from '@/types/sprint'
import { mount } from 'cypress/react'
import SprintConfiguration from '@/app/sprint_planning/components/SprintConfiguration'

describe('SprintConfiguration Component', () => {
  const baseSprint: Sprint & { max_points?: number } = {
    id: '1',
    name: 'Sprint 1',
    duration_weeks: 2,
    start_date: '2025-05-01T00:00:00.000Z',
    end_date:   '2025-05-15T00:00:00.000Z',
    max_points: 20,
  }

  let onUpdate: Cypress.Agent<sinon.SinonStub>

  beforeEach(() => {
    onUpdate = cy.stub().as('onUpdate')
    mount(
      <SprintConfiguration
        sprint={baseSprint}
        onUpdate={onUpdate}
      />
    )
  })

  it('renders initial values', () => {
    // Sprint name
    cy.contains('Sprint name')
      .parent()
      .find('input')
      .should('have.value', baseSprint.name)

    // Duration
    cy.contains('Duration (weeks)')
      .parent()
      .find('input')
      .should('have.value', baseSprint.duration_weeks.toString())

    // Start Date
    cy.contains('Start Date')
      .parent()
      .find('input')
      .should('have.value', '2025-05-01')

    // End Date
    cy.contains('End Date')
      .parent()
      .find('input')
      .should('have.value', '2025-05-15')

    // Capacity
    cy.contains('Team Capacity')
      .parent()
      .find('input')
      .should('have.value', baseSprint.max_points!.toString())
  })

  it('calls onUpdate when name changes', () => {
    cy.contains('Sprint name')
      .parent()
      .find('input')
      .clear()
      .type('My New Sprint')

    cy.get('@onUpdate')
      .should('have.been.calledWithMatch', { name: 'My New Sprint' })
  })

  it('calls onUpdate when duration changes and recalculates end date', () => {
    cy.contains('Duration (weeks)')
      .parent()
      .find('input')
      .clear()
      .type('4')

    cy.get('@onUpdate')
      .should('have.been.calledWithMatch', { duration_weeks: 4 })

    cy.get('@onUpdate')
      .should('have.been.calledWithMatch', (arg: any) => {
        return arg.end_date.startsWith('2025-05-29T')
      })
  })

  it('calls onUpdate when start date changes and recalculates end date', () => {
    cy.contains('Start Date')
      .parent()
      .find('input')
      .clear()
      .type('2025-05-10')

    cy.get('@onUpdate')
      .should('have.been.calledWithMatch', (arg: any) => 
        arg.start_date.startsWith('2025-05-10T')
      )

    cy.get('@onUpdate')
      .should('have.been.calledWithMatch', (arg: any) => 
        arg.end_date.startsWith('2025-05-24T')
      )
  })

  it('calls onUpdate when capacity changes', () => {
    cy.contains('Team Capacity')
      .parent()
      .find('input')
      .clear()
      .type('30')

    cy.get('@onUpdate')
      .should('have.been.calledWithMatch', { max_points: 30 })
  })
})
