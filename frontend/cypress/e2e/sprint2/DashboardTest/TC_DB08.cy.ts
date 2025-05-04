describe('Task display test', () => {
    it('Task displayed succesfully', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
    })
  })