import React from 'react'
import AddCommentModal from '../../src/app/dashboard/components/productbacklog/productbacklog.addcommentmodal'
import { BacklogProvider } from '@/contexts/backlogcontext'

describe('AddCommentModal.cy.tsx', () => {
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
    backlog: [{ id: 'task1', title: 'Test Task', comments: mockComments }],
    todo: [],
    inprogress: [],
    inreview: [],
    done: []
  }

  beforeEach(() => {
    // Mock localStorage
    cy.stub(window.localStorage, 'getItem')
      .withArgs('userId').returns('123')
      .withArgs('currentProjectId').returns('project123')
  })

  it('displays the modal with correct title and comments', () => {
    const onClose = cy.stub().as('onClose')
    const onCommentsChange = cy.stub().as('onCommentsChange')

    // Mount component with BacklogProvider to provide context
    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <AddCommentModal
          onClose={onClose}
          taskId="task1"
          taskTitle="Test Task"
          comments={mockComments}
          onCommentsChange={onCommentsChange}
        />
      </BacklogProvider>
    )

    // Check if modal title displays correctly
    cy.contains('Comment on Test Task').should('be.visible')

    // Check if existing comments are displayed
    cy.contains('Test User').should('be.visible')
    cy.contains('This is a test comment').should('be.visible')
    cy.contains('Another User').should('be.visible')
    cy.contains('This is another test comment').should('be.visible')
  })

  it('allows typing in the comment box', () => {
    const onClose = cy.stub()
    const onCommentsChange = cy.stub()

    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <AddCommentModal
          onClose={onClose}
          taskId="task1"
          taskTitle="Test Task"
          comments={mockComments}
          onCommentsChange={onCommentsChange}
        />
      </BacklogProvider>
    )

    // Test typing in the comment field
    cy.get('textarea').type('This is a new comment')
    cy.get('textarea').should('have.value', 'This is a new comment')
  })

  it('shows UI elements for own comments', () => {
    const onClose = cy.stub()
    const onCommentsChange = cy.stub()

    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <AddCommentModal
          onClose={onClose}
          taskId="task1"
          taskTitle="Test Task"
          comments={mockComments}
          onCommentsChange={onCommentsChange}
        />
      </BacklogProvider>
    )

    // The first comment belongs to user '123' (same as mocked userId)
    // so the delete button should be visible for it
    cy.get('[title="Delete comment"]').should('have.length', 1)
  })

  it('respects the modal close action', () => {
    const onClose = cy.stub().as('onClose')
    const onCommentsChange = cy.stub()

    cy.mount(
      <BacklogProvider initialTasks={mockTasks}>
        <AddCommentModal
          onClose={onClose}
          taskId="task1"
          taskTitle="Test Task"
          comments={mockComments}
          onCommentsChange={onCommentsChange}
        />
      </BacklogProvider>
    )

    // Test clicking the Cancel button closes the modal
    cy.contains('button', 'Cancel').click()
    cy.get('@onClose').should('have.been.calledOnce')
  })
})