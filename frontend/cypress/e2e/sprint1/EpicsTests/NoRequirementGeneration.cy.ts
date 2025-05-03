describe('Empty requirements Test', () => {
    it('Epics are not generated', () => {
      cy.login();
      cy.wait(6000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get(':nth-child(2) > a > .justify-center').click()
      cy.get('.space-x-4> .flex > .text-white').click()
    })
  })    