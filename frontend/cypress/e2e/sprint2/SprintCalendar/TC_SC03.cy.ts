describe('Day view test', () => {
  it('calendar page loaded succesfully', () => {
    cy.login();
    cy.wait(2000)
    cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
    cy.get(':nth-child(1) > .mt-auto > .inline-flex').click()
    cy.wait(3000)
  })
})    