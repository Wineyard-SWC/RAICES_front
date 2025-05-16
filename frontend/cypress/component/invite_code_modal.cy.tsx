import React from 'react'
import InviteCodeModal from '@/app/projects/components/invite_code_modal'

describe('InviteCodeModal.cy.tsx', () => {
  it('monta el modal abierto con código y título', () => {
    const onClose = cy.stub().as('onClose')

    cy.mount(
      <InviteCodeModal
        isOpen={true}
        onClose={onClose}
        invitationCode="ABC123"
        projectTitle="Proyecto de Test"
      />
    )

    cy.get('h2').should('contain.text', 'Invite to Project')
    cy.get('strong').should('contain.text', 'Proyecto de Test')
    cy.get('button').contains('Close').click()
    cy.get('@onClose').should('have.been.calledOnce')
  })
})
