describe('template spec', () => {
  it('passes', () => {
    cy.login();
    cy.wait(4000)

    cy.contains('h2', 'Sales App Wineyard').click()
    cy.wait(4000)

    cy.contains('button', 'View full Backlog').click()
    cy.wait(4000)

    cy.get('input[placeholder="Search sprint elements..."]')
      .clear()
      .type("user")

  })
})