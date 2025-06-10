describe('User can add elements in a dependency map', () => {
  it('User can add elements in a dependency map', () => {
        
    cy.login();
    cy.wait(10000);  
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

    cy.contains('button','Dependency Map').click();
      cy.wait(6000);
    
    cy.get('li')  
      .find('div')  
      .contains('CAMBIO TITULO CYPRESS PRUEBA DEPENDENCY MAP')  
      .parents('li') 
      .find('button')  
      .contains('Load')  
      .click();
    cy.wait(1000);

    cy.contains('button','New Phase').click();
    
    cy.get('input[placeholder="e.g., Frontend Development"]') 
      .clear()  
      .type('CREACION FASE CYPRESS PRUEBA');
    cy.wait(500);
    
    cy.get('textarea[placeholder="Phase description..."]')
      .clear()
      .type('CREACION FASE CYPRESS PRUEBA'); 
    cy.wait(500);

    cy.contains('button','Create Phase').click();

    cy.contains('span', 'CREACION FASE CYPRESS PRUEBA')  
      .closest('div')
      .should('exist')

    })
})