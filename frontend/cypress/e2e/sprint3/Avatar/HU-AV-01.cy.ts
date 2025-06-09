const pages = [
  'Sprints',  
  'Dependency Map',  
  'Team',
  'Generate'  
];

const verifyAvatar = () => {
    cy.get('model-viewer')
      .should('exist');
}

describe('User can view detailed view of a team', () => {
  it('User can view detailed view of a team', () => {
    
    
    cy.login();
    cy.wait(10000);
    cy.login();
    cy.wait(10000);


    verifyAvatar();

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
    cy.wait(4000);

    pages.forEach((page) => { 
        verifyAvatar();
        cy.wait(1000);

        cy.contains('button', page ).click();
        cy.wait(6000);

    });

  })
})