describe('User can delete an element from the dependency map', () => {
  it('User can delete an element from the dependency map', () => {
        
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
    
    cy.get('div.space-y-2')  
      .first()  
      .find('button[title="Remove from roadmap"]') 
      .click();

    cy.contains('p',/No user storys in roadmap/)
      .should('exist')

    })
})