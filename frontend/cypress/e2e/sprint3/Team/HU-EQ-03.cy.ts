describe('User can delete a Team', () => {
  it('User can delete a Team', () => {
    cy.login();
    cy.wait(10000);
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
    cy.wait(4000);

    cy.contains('button','Team').click();
    cy.wait(6000);

    cy.contains('h3', 'Equipo Pruebas Cypress')
      .parent() 
      .find('button.text-gray-400.hover\\:text-red-500')  // Seleccionamos el botón que tiene la clase `hover:text-red-500`
      .click();

    cy.contains('button','Delete Team').click();


    cy.contains('h3', 'Equipo Pruebas Cypress')
      .should('not.exist');
  })
})