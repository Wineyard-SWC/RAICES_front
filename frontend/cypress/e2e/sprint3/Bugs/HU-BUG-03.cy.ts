describe('User can not leave title and description input text areas in blank', () => {
  it('User can not leave title and description input text areas in blank', () => {

      cy.login();
      cy.wait(10000);
      cy.login();
      cy.wait(10000);


      cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

      cy.contains('button', 'View full Backlog').click();
      cy.wait(4000);

      cy.contains('h3', 'BUG PRUEBA EDICION').click();
      cy.wait(4000);
      
      cy.contains('button', ' Edit').click();
      cy.wait(4000);

      //Editar titulo en el textarea
      cy.get('input[placeholder="Enter bug title"]')
        .clear()
        
      //Editar descripcion en el textarea
      cy.get('textarea[placeholder="Enter bug description"]')
        .clear()
    
      
      cy.contains('button', ' Save Changes').click();
      cy.wait(500);


      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
        .find('p[class*="text-red-500 text-sm mt-1"]')
        .contains('p', 'Description is required')
        .should('exist');

      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm')
        .find('p[class*="text-red-500 text-sm mt-1"]')
        .contains('p', 'Description is required')
        .should('exist'); 
        
      cy.contains('button', 'Cancel').click();
    })
})