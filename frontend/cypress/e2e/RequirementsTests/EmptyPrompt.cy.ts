describe('Empty promt Test', () => {
    it('Requirements are not succesfully generated', () => {
      cy.login();
      cy.wait(6000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get('.grid > :nth-child(1) > a > .justify-center').click()
      cy.contains('Generate Requirements').click()
    })
  })    