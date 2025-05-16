import React from 'react'
import EditProjectModal from '@/app/projects/components/edit_project_modal'
import * as useUpdateProjectModule from '@/hooks/useUpdateProjects'

describe('EditProjectModal.cy.tsx', () => {
  const mockProject = {
    id: '123',
    title: 'Test Project',
    description: 'Test Description',
    status: 'Active',
    priority: 'Medium',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    invitationCode: 'INV123',
    progress: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    team: 'TST-TEAM',
    teamSize: 1
  }

  let mockUpdateProject: {
    updateProject: Cypress.Agent<sinon.SinonStub>
    loading: boolean
    error: string | null
  }

  beforeEach(() => {
    mockUpdateProject = {
      updateProject: cy.stub().as('updateProject').resolves(true),
      loading: false,
      error: null
    }
    cy.stub(useUpdateProjectModule, 'useUpdateProject').returns(mockUpdateProject)
  })

  it('se monta correctamente y muestra los datos del proyecto', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <EditProjectModal
        isOpen={true}
        onClose={onClose}
        project={mockProject}
      />
    )

    // Verificar que el título del modal es correcto
    cy.get('h2').should('contain.text', 'Edit Project')
    
    // Verificar que los campos tienen los valores iniciales
    cy.get('input[placeholder="Enter project title"]').should('have.value', mockProject.title)
    cy.get('textarea').should('have.value', mockProject.description)
    cy.get('select').first().should('have.value', mockProject.status)
    cy.get('select').eq(1).should('have.value', mockProject.priority)
    cy.get('input[type="date"]').first().should('have.value', '2023-01-01')
    cy.get('input[type="date"]').last().should('have.value', '2023-12-31')
    
    // Verificar que los botones están presentes
    cy.contains('button', 'Cancel').should('exist')
    cy.contains('button', 'Save changes').should('exist')
  })

  it('permite cerrar el modal con el botón Cancel', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <EditProjectModal
        isOpen={true}
        onClose={onClose}
        project={mockProject}
      />
    )

    cy.contains('button', 'Cancel').click()
    cy.get('@onClose').should('have.been.calledOnce')
  })

  it('permite actualizar los campos del formulario', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <EditProjectModal
        isOpen={true}
        onClose={onClose}
        project={mockProject}
      />
    )

    // Actualizar título
    cy.get('input[placeholder="Enter project title"]')
      .clear()
      .type('Nuevo título del proyecto')
      .should('have.value', 'Nuevo título del proyecto')

    // Actualizar descripción
    cy.get('textarea')
      .clear()
      .type('Nueva descripción del proyecto')
      .should('have.value', 'Nueva descripción del proyecto')

    // Cambiar estado
    cy.get('select').first().select('On Hold').should('have.value', 'On Hold')

    // Cambiar prioridad
    cy.get('select').eq(1).select('High').should('have.value', 'High')

    // Cambiar fechas
    cy.get('input[type="date"]').first().clear().type('2023-02-01')
    cy.get('input[type="date"]').last().clear().type('2023-11-30')
  })

  it('valida el formulario antes de enviar', () => {
    const onClose = cy.stub().as('onClose')
    
    cy.mount(
      <EditProjectModal
        isOpen={true}
        onClose={onClose}
        project={mockProject}
      />
    )

    // Limpiar campos requeridos
    cy.get('input[placeholder="Enter project title"]').clear()
    cy.get('textarea').clear()
    cy.get('input[type="date"]').first().clear()
    cy.get('input[type="date"]').last().clear()

    // Intentar enviar
    cy.contains('button', 'Save changes').click()

    // Verificar mensajes de error
    cy.contains('Title is required').should('exist')
    cy.contains('Description is required').should('exist')
    cy.contains('Start date is required').should('exist')
    cy.contains('End date is required').should('exist')
  })
})