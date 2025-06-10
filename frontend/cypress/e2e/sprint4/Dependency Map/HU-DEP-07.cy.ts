describe('User can not delete a dependency map if canceled in confirmation modal', () => {
  it('User can not delete a dependency map if canceled in confirmation modal', () => {
        
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
      .find('svg.lucide.lucide-trash2')
      .first()
      .click(); 
    cy.wait(500);

    cy.contains('button', 'Cancel').click();
    
    cy.get('li')  
      .find('div')  
      .contains('DEPENDENCY MAP FOR DELETE')   
      .should('exist');
    })
})