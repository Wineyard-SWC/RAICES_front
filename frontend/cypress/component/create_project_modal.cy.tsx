import React from 'react'
import CreateProjectModal from '@/app/projects/components/create_project_modal'

import * as usersHook from '@/hooks/useUsers'

describe('CreateProjectModal.cy.tsx', () => {
  beforeEach(() => {
    cy.stub(usersHook, 'useUsers').returns({
      users: [],
      loading: false,
      searchUsers: cy.stub()
    })
  })

  it('monta el modal abierto y permite interacción básica', () => {
    const onClose = cy.stub().as('onClose')
    const onCreateProject = cy.stub().as('onCreateProject').resolves()

    cy.mount(
      <CreateProjectModal
        isOpen={true}
        onClose={onClose}
        onCreateProject={onCreateProject}
      />
    )

    cy.get('h2').should('contain.text', 'Create New Project')

    cy.get('input[placeholder="Enter the project title"]')
      .type('Mi Proyecto de Prueba')
    cy.get('textarea[placeholder="Describe the project"]')
      .type('Descripción de prueba')

    cy.contains('button', 'Create Project').click()

    cy.get('@onCreateProject').should('have.been.calledOnce')
    cy.get('@onClose').should('have.been.calledOnce')
  })
})
