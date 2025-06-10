describe('User can create a new dependency map', () => {
  it('User can create a new dependency map', () => {
        
    cy.login();
    cy.wait(10000);  
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

    cy.contains('button','Dependency Map').click();
      cy.wait(6000);
  
    cy.contains('button','Create New Map').click();
      cy.wait(1000);

    cy.get('input[placeholder="e.g., MVP Release v1.0"]')
      .type("DEPENDENCY MAP CYPRESS PRUEBA");

    cy.get('textarea[placeholder="Map description..."]')
      .type("DEPENDENCY MAP CYPRESS PRUEBA");

    cy.contains('button', 'Create Roadmap').click();
    cy.wait(2000);
    
    })
})