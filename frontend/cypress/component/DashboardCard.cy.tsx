import React from 'react'
import BacklogCard from '../../src/app/dashboard/components/productbacklog/productbacklog.backlogcard'
import { BacklogProvider } from '@/contexts/backlogcontext'

describe('BacklogCard.cy.tsx', () => {
  // Mock data for testing
  const mockComments = [
    {
      id: '1',
      user_id: '123',
      user_name: 'Test User',
      text: 'This is a test comment',
      timestamp: '2025-05-16T10:00:00.000Z'
    },
    {
      id: '2',
      user_id: '456',
      user_name: 'Another User',
      text: 'This is another test comment',
      timestamp: '2025-05-16T11:00:00.000Z'
    }
  ]

  const mockTasks = {
    backlog: [
      { 
        id: 'task1', 
        title: 'Test Task', 
        comments: mockComments,
        status: 'In Review'
      }
    ],
    todo: [],
    inprogress: [],
    inreview: [],
    done: []
  }

  // Mock the user data that would normally be returned by API
  const mockUserData = {
    author123: { id: 'author123', name: 'John Author', email: 'john@example.com', role: 'Developer' },
    reviewer456: { id: 'reviewer456', name: 'Jane Reviewer', email: 'jane@example.com', role: 'Reviewer' }
  }

  beforeEach(() => {
    // Mock localStorage para usuarios en caché y usuario actual
    const cachedUsers = JSON.stringify({
      'author123': mockUserData.author123,
      'reviewer456': mockUserData.reviewer456
    })
    
    cy.stub(window.localStorage, 'getItem')
      .withArgs('userId').returns('123')
      .withArgs('currentProjectId').returns('project123')
      .withArgs('cached_users').returns(cachedUsers)
    
    cy.stub(window.localStorage, 'setItem').as('setItem')
    
    // No necesitamos stub para fetch ya que evitaremos llamadas API
    // al proveer todos los datos necesarios localmente
    
    // Para ignorar llamadas fetch inesperadas, podemos stub con un error
    cy.stub(window, 'fetch').callsFake(() => {
      console.warn("⚠️ Se intentó hacer una llamada fetch. Las pruebas deberían usar solo datos locales.");
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  })

  it('displays card with correct information', () => {
    // Utilizamos un mock para updateTaskStatus que será proporcionado
    // a través del contexto de BacklogProvider
    const updateTaskStatusStub = cy.stub().as('updateTaskStatus')

    // Los datos del componente vienen de props, no de API
    cy.mount(
      <BacklogProvider 
        initialTasks={mockTasks} 
        updateTaskStatus={updateTaskStatusStub}
      >
        <BacklogCard
          id="task1"
          type="FEATURE"
          priority="medium"
          status="In Review"
          title="Implementar autenticación"
          description="Añadir sistema de login con JWT"
          author="author123"
          reviewer="reviewer456"
          progress={75}
          comments={mockComments}
        />
      </BacklogProvider>
    )

    // Verificamos que se muestre correctamente la información básica
    cy.contains('FEATURE').should('be.visible')
    cy.contains('medium').should('be.visible')
    cy.contains('Implementar autenticación').should('be.visible')
    cy.contains('Añadir sistema de login con JWT').should('be.visible')
    
    // Verificamos que se muestren los nombres desde el localStorage
    // Si estos selectores fallan, ajústalos según la estructura real del componente
    cy.contains(/John Author/).should('be.visible')
    cy.contains(/Jane Reviewer/).should('be.visible')
    
    // Verificar contador de comentarios
    cy.contains('2 Comments').should('be.visible')
    
    // Verificar barra de progreso
    // Ajusta estos selectores según la implementación real
    cy.get('.h-2').should('exist')
    cy.contains('75%').should('be.visible')
  })

  it('opens the menu when clicked', () => {
    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <BacklogCard
          id="task1"
          type="FEATURE"
          priority="medium"
          status="In Review"
          title="Implementar autenticación"
          description="Añadir sistema de login con JWT"
          author="author123"
          reviewer="reviewer456"
          progress={75}
          comments={mockComments}
        />
      </BacklogProvider>
    )

    // El menú debería estar oculto inicialmente
    cy.contains('Add Comment').should('not.exist')
    
    // Hacemos clic en el botón de menú y verificamos que se abra
    cy.get('button:has(.h-4.w-4)').first().click()
    cy.contains('Add Comment').should('be.visible')
  })

  it('opens comment modal when Add Comment is clicked', () => {
    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <BacklogCard
          id="task1"
          type="FEATURE"
          priority="medium"
          status="In Review"
          title="Implementar autenticación"
          description="Añadir sistema de login con JWT"
          author="author123"
          reviewer="reviewer456"
          progress={75}
          comments={mockComments}
        />
      </BacklogProvider>
    )

    // Abrir menú y hacer clic en Add Comment
    cy.get('button:has(.h-4.w-4)').first().click()
    cy.contains('Add Comment').click()
    
    // Verificar que se abra el modal de comentarios
    // Esta comprobación depende de cómo el modal presente su título
    cy.contains(/Comment on|Comentar en/).should('be.visible')
  })

  it('shows confirmation dialog when Accept is clicked', () => {
    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <BacklogCard
          id="task1"
          type="FEATURE"
          priority="medium"
          status="In Review"
          title="Implementar autenticación"
          description="Añadir sistema de login con JWT"
          author="author123"
          reviewer="reviewer456"
          progress={75}
          comments={mockComments}
        />
      </BacklogProvider>
    )

    // Hacer clic en botón Accept
    cy.contains('Accept').click()
    
    // Verificar diálogo de confirmación
    cy.contains('Accept Task').should('be.visible')
    cy.contains('Are you sure you want to mark this task as Done?').should('be.visible')
  })

  it('shows confirmation dialog when Reject is clicked', () => {
    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <BacklogCard
          id="task1"
          type="FEATURE"
          priority="medium"
          status="In Review"
          title="Implementar autenticación"
          description="Añadir sistema de login con JWT"
          author="author123"
          reviewer="reviewer456"
          progress={75}
          comments={mockComments}
        />
      </BacklogProvider>
    )

    // Hacer clic en botón Reject
    cy.contains('Reject').click()
    
    // Verificar diálogo de confirmación
    cy.contains('Reject Task').should('be.visible')
    cy.contains('Are you sure you want to send this task back to In Progress?').should('be.visible')
  })
})