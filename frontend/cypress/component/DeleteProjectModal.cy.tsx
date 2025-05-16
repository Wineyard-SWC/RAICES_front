import React from 'react'
import DeleteProjectModal from '@/app/projects/components/delete_project_modal'
import * as useDeleteProjectModule from '@/hooks/useDeleteProject'

describe('DeleteProjectModal - Pruebas Exitosas', () => {
  const projectId = '123'
  const projectTitle = 'Test Project'
  
  let mockDeleteProject: {
    deleteProject: Cypress.Agent<sinon.SinonStub>
    error: string | null
  }

  beforeEach(() => {
    mockDeleteProject = {
      deleteProject: cy.stub().as('deleteProject').resolves(true),
      error: null
    }
    cy.stub(useDeleteProjectModule, 'useDeleteProject').returns(mockDeleteProject)
  })

  it('se monta correctamente y muestra la información del proyecto', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <DeleteProjectModal
        isOpen={true}
        onClose={onClose}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    )

    cy.get('h2').should('contain.text', 'Delete Project')
    cy.contains('strong', `"${projectTitle}"`).should('exist')
    cy.contains('Are you sure?').should('exist')
    cy.contains('This action cannot be undone').should('exist')
    cy.contains('button', 'Cancel').should('exist')
    cy.contains('button', 'Delete').should('exist')
  })

  it('permite cerrar el modal con el botón Cancel', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <DeleteProjectModal
        isOpen={true}
        onClose={onClose}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    )

    cy.contains('button', 'Cancel').click()
    cy.get('@onClose').should('have.been.calledOnce')
  })

  it('no permite cerrar el modal haciendo clic en el contenido', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <DeleteProjectModal
        isOpen={true}
        onClose={onClose}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    )

    cy.get('.bg-white').click()
    cy.get('@onClose').should('not.have.been.called')
  })
})