import React from 'react'
import { mount } from 'cypress/react'
import TaskList from '@/app/task_assignment/components/TaskList'
import type { Task } from '@/types/task'
import type { SprintMember } from '@/types/sprint'

describe('TaskList Component', () => {
  const dummyTask: Task = {
    id: 't1',
    title: 'Implement feature X',
    description: 'Details about feature X',
    priority: 'High',
    story_points: 5,
    assignee_id: '',
    assignee: '',
  }

  const teamMembers: SprintMember[] = [
    { id: 'm1', name: 'Alice', role: 'Dev', avatar: '', capacity: 10, allocated: 2 },
    { id: 'm2', name: 'Bob', role: 'QA', avatar: '', capacity: 3, allocated: 3 },
    { id: 'm3', name: 'Charlie', role: 'Dev', avatar: '', capacity: 4, allocated: 1 },
  ]

  it('displays task details and recommended members, and calls onAssign', () => {
    const onAssign = cy.stub().as('onAssign')

    mount(<TaskList task={dummyTask} teamMembers={teamMembers} onAssign={onAssign} />)

    // Check badges and points
    cy.contains('TASK').should('be.visible')
    cy.contains('high').should('be.visible')
    cy.contains('5 points').should('be.visible')

    // Unassigned text
    cy.contains('Unassigned').should('be.visible')

    // Title and description
    cy.contains('Implement feature X').should('be.visible')
    cy.contains('Details about feature X').should('be.visible')

    // Recommended Team Members header
    cy.contains('Recommended Team Members').should('be.visible')


  })
})
