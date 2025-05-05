describe('Clear user histories Test', () => {
    it('Deleted the loaded epics succesfully', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-l-none').click()
      cy.get('.py-1 > :nth-child(3)').click()
      cy.contains('Import from project').click()
      cy.contains('Confirm').click()
      cy.wait(2000)
      cy.get('.space-x-4 > .flex > .bg-white').click()
      cy.contains('Confirm').click()
    })
  })    