describe('User can view a preview of elements previous to adding them to the dependency map', () => {
  it('User can view a preview of elements previous to adding them to the dependency map', () => {
        
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

    cy.contains('span', 'CYPRESS PRUEBAS FASE')  
      .closest('div')
      .click();

    cy.wait(100);

    cy.contains('button','Add Elements').click();
    
    cy.get('div.border')  
      .first()  
      .find('button') 
      .contains(/Show Preview/) 
      .click();

    cy.get('div') 
      .contains('Structure Preview')
      .should('exist');

    })
})