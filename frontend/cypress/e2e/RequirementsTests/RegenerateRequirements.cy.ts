describe('Requirements Test', () => {
    it('Requirements are succesfully regenerated', () => {
      cy.login();
      cy.wait(6000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get('.grid > :nth-child(1) > a > .justify-center').click()
      cy.fixture('requirementContext').then((user) => {
        cy.get('.p-3').type(user.ValidProjectContext)
      })
      cy.contains('Generate Requirements').click()
      cy.wait(60000)
      cy.get('.mt-auto > :nth-child(1)').click()
    })
  })    