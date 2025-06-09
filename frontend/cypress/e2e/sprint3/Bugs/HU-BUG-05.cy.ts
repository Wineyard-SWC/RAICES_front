describe('User can delete an existing Bug', () => {
  it('User can delete an existing Bug', () => {
    
      cy.login();
      cy.wait(10000);
      cy.login();
      cy.wait(10000);


      cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

      cy.contains('button', 'View full Backlog').click();
      cy.wait(4000);

      cy.contains('h3','BUG PRUEBA ELIMINACION')  
        .closest('div.bg-white')
        .find('button[data-slot="button"]')
        .find('svg[class*="lucide-ellipsis-vertical"]')
        .click({ force: true });
      cy.wait(1000);


      cy.contains('button',' Delete').click()

      cy.contains('button','Confirm').click()
      
  })
})