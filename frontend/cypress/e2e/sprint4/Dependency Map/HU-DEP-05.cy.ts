describe('User can save changes of a dependency map', () => {
  it('User can save changes of a dependency map', () => {
        
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
      .contains('CAMBIO TITULO CYPRESS PRUEBA DEPENDENCY MAP')  // Encuentra el div con el texto
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
      .contains(/Add/) 
      .click();

    cy.get('div.w-80')
      .find('h3') 
      .should('contain.text', 'In Roadmap');  

    cy.get('div.w-80')
      .find('div.text-center')
      .should('not.exist'); 
    
    cy.contains('button', 'Done').click();

    cy.contains('button','Save').click();

    })
})