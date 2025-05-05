describe('Generate user histories Test', () => {
    it('Succesfully created user histories with selected epics', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-l-none').click()
      cy.get('.py-1 > :nth-child(3)').click()
      cy.contains('Import from project').click()
      cy.contains('Confirm').click()
      cy.contains('Generate User Stories').click()
      cy.contains('Confirm').click()
    })
  })    