describe('Requirements Test', () => {
    it('Requirements are succesfully generated', () => {
      cy.login();
      cy.wait(5000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get('.grid > :nth-child(1) > a > .justify-center').click()
      cy.fixture('requirementContext').then((user) => {
        cy.get('.p-3').type(user.AltProjectContext)
      })
      cy.contains('Generate Requirements').click()
    })
  })    
