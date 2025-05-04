describe('Filter Calendar data test', () => {
  it('calendar data filter succesfully', () => {
    cy.login();
    cy.wait(2000)
    cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
    cy.get(':nth-child(1) > .mt-auto > .inline-flex').click()
    cy.get('.mb-6 > .flex > :nth-child(1)').click()
  })
})    