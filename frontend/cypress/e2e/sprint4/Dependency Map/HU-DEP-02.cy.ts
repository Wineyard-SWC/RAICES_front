describe('User can view all dependency maps of a project', () => {
  it('User can view all dependency maps of a project', () => {
        
    cy.login();
    cy.wait(10000);  
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

    cy.contains('button','Dependency Map').click();
      cy.wait(6000);
  
    cy.get('div.p-6.flex-1.flex.flex-col')
      .find('div.text-gray-500.text-center')
      .should('not.contain.text', 'No recent dependencies yet.')

    cy.get('div.bg-white.rounded-xl.shadow-lg').should('exist'); 
    cy.get('ul li').should('have.length.greaterThan', 0);
    
    })
})