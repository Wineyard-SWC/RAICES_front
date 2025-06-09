describe('User can view detailed view of a team', () => {
  it('User can view detailed view of a team', () => {
    cy.login();
    cy.wait(10000);
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
    cy.wait(4000);

    cy.contains('button','Team').click();
    cy.wait(6000);

    cy.contains('h3','Project Team').click();
    cy.wait(10000);

    cy.contains('h2','Team Metrics')
      .should('exist');

    cy.contains('h2','Team Members')
      .should('exist');

  })
})