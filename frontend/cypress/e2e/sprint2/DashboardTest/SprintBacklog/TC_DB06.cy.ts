describe('Sprint velocity data test', () => {
  it('Sprint velocity data card loaded succesfully', () => {
    cy.login();
    cy.wait(2000)
    cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
    cy.contains('View full Backlog').click()
  })
})    