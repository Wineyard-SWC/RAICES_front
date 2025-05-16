import React from 'react'
import TeamMembersSection from '@/app/sprint_planning/components/TeamMembersSection'
import type { SprintMember } from '@/types/sprint'

describe('TeamMembersSection.cy.tsx', () => {
  const projectId = 'proj1'
  const ownerId = 'u1'
  const initialMembers: SprintMember[] = [
    { id: 'u1', name: 'Owner', role: 'Lead', avatar: '', capacity: 8, allocated: 2 },
    { id: 'u3', name: 'Member Three', role: 'Dev', avatar: '', capacity: 5, allocated: 5 },
  ]

  beforeEach(() => {
    cy.intercept(
      'GET',
      `**/project_users/project/${projectId}`,
      {
        statusCode: 200,
        body: [
          { id: 'u1', name: 'User One', email: 'one@example.com', photoURL: '', role: 'Dev' },
          { id: 'u2', name: 'User Two', email: 'two@example.com', photoURL: '', role: 'PM' },
        ],
      }
    ).as('getProjectUsers')
  })

  it('monta la sección con miembros existentes y el botón Add Member', () => {
    const onAdd = cy.stub().as('onAdd')
    const onUpdate = cy.stub().as('onUpdate')
    const onRemove = cy.stub().as('onRemove')

    cy.mount(
      <TeamMembersSection
        projectId={projectId}
        ownerId={ownerId}
        members={initialMembers}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    )

    cy.contains('Owner')
    cy.contains('Member Three')
    cy.contains('Add Member')
  })

  it('llama onRemove al eliminar un miembro que no es owner', () => {
    const onAdd = cy.stub().as('onAdd')
    const onUpdate = cy.stub().as('onUpdate')
    const onRemove = cy.stub().as('onRemove')

    cy.mount(
      <TeamMembersSection
        projectId={projectId}
        ownerId={ownerId}
        members={initialMembers}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    )

    cy.get('[aria-label="Remove member"]').should('have.length', 1).click()
    cy.get('@onRemove').should('have.been.calledOnceWith', 'u3')
  })

  it('abre modal, selecciona un usuario y llama onAdd', () => {
    const onAdd = cy.stub().as('onAdd')
    const onUpdate = cy.stub().as('onUpdate')
    const onRemove = cy.stub().as('onRemove')

    cy.mount(
      <TeamMembersSection
        projectId={projectId}
        ownerId={ownerId}
        members={initialMembers}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    )

    // Abre el modal de agregar miembro
    cy.contains('Add Member').click()
    cy.wait('@getProjectUsers')

    // Selecciona el usuario u2
    cy.get('select').select('u2')
    cy.contains(/^Add$/).click()

    cy.get('@onAdd').should(
      'have.been.calledWith',
      Cypress.sinon.match({ id: 'u2', name: 'User Two', role: 'PM' })
    )
  })
})