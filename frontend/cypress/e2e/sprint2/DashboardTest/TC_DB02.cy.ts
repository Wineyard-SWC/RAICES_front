describe('Calendar view test', () => {
  it('calendar page loaded succesfully', () => {
    cy.login();
    cy.wait(2000)
    cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
  })
})    