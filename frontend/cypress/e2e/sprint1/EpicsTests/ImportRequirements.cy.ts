describe('Import requirements Test', () => {
    it('Requirements are succesfully imported', () => {
      cy.login();
      cy.wait(6000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get(':nth-child(2) > a > .justify-center').click()
      cy.contains('Import from project\'s requirements').click()
      cy.contains('Confirm').click()
      cy.get('.gap-3 > :nth-child(1)').click()
    })
  })    