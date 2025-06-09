describe('User can create a Team', () => {
  it('User can create a Team', () => {
    
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


      cy.get('input[placeholder="Enter the team name"]')
        .type('Equipo Pruebas Cypress');

      cy.get('textarea[placeholder="Describe the team\'s purpose"]')
        .type('Equipo hecho para probar funcionalidad cypress');

      cy.get('input[placeholder="Search users by name or email"]')
        .type('Raymundo');
      cy.wait(10000);

      cy.get('ul') 
        .find('li') 
        .contains('Raymundo Medina Arzola')
        .parents('li')
        .then(($li) => {
          cy.wrap($li).click(); 
        });
      
      cy.contains('button','Create Team').click();

  })
})