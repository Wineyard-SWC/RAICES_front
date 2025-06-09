describe('User can not create a Team with empty values', () => {
  it('User can not create a Team with empty values', () => {
    cy.login();
    cy.wait(10000);
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
    cy.wait(4000);

    cy.contains('button','Team').click();
    cy.wait(6000);

    cy.contains('button','New').click();
    cy.wait(500);

    cy.contains('button','Create Team').click();

    //Verificar que los mensajes de error existan
    cy.get('p[class*="text-red-500 text-xs mt-1"]')
        .contains('p', 'Team name is required')
        .should('exist');

    cy.get('p[class*="text-red-500 text-xs mt-1"]')
        .contains('p', 'Description is required')
        .should('exist');
    
    cy.get('p[class*="text-red-500 text-xs mt-1"]')
        .contains('p', 'At least one member is required')
        .should('exist');
  })
})