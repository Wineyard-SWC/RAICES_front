describe('Clear Context Test', () => {
    it('Context its cleared succesfully', () => {
      cy.login();
      cy.wait(6000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get('.grid > :nth-child(1) > a > .justify-center').click()
      cy.fixture('requirementContext').then((user) => {
        cy.get('.p-3').type(user.ValidProjectContext)
      })
      cy.get('.space-x-4 > .flex > .bg-white').click()
      cy.contains('Confirm').click()
    })
  })    