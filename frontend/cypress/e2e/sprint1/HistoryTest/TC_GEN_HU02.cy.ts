describe('No user histories Test', () => {
    it('Failed to create user histories with 0 epics', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-l-none').click()
      cy.get('.py-1 > :nth-child(3)').click()
      cy.contains('Generate User Stories').click()
      cy.contains('Confirm').click()
    })
  })    