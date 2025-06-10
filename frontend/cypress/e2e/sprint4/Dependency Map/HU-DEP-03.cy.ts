describe('User can change the description and title of a dependency map', () => {
  it('User can change the description and title of a dependency map', () => {
        
    cy.login();
    cy.wait(10000);  
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

    cy.contains('button','Dependency Map').click();
      cy.wait(6000);
  
    cy.contains('button','Load Existing').click();
      cy.wait(1000);

    cy.get('button')
      .find('svg.lucide.lucide-pencil')
      .first()
      .click(); 
    cy.wait(500);

    cy.get('input[placeholder="Nombre del roadmap"]') 
      .clear()  
      .type('CAMBIO TITULO CYPRESS PRUEBA DEPENDENCY MAP');
    cy.wait(500);
    
    cy.get('textarea[placeholder="Descripción del roadmap (opcional)"]')
      .clear()
      .type('CAMBIO DESCRIPCION CYPRESS PRUEBA DEPENDENCY MAP'); 
    cy.wait(500);

    cy.contains('button', 'Save').click(); 
    
    })
})