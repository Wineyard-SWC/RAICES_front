describe('Velocity and burntdown chart display test', () => {
    it('Load burntdown chart and velocity data succesfully', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get(':nth-child(2) > .flex.mt-auto > .inline-flex').click()
    })
  })    