describe('User can create a Bug', () => {
  it('User can create a Bug', () => {

    cy.login();
    cy.wait(10000);
    cy.login();
    cy.wait(10000);

    cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
    cy.wait(4000);

    cy.contains('button', 'View full Backlog').click();
    cy.wait(4000);

    cy.contains('button',' Create Item').click();
    cy.wait(1000);

    cy.contains('button', 'Bug Report').click();
    cy.wait(1000);

     cy.get('input[placeholder="Brief description of the bug"]')
      .type('BUG CREADO PRUEBA');
    
    cy.get('textarea[placeholder="Detailed description of the bug"]')
      .type('BUG CREADO PRUEBA');
    
    cy.get('select[aria-label="priority"]')
      .select('Medium');
    
    cy.get('select[aria-label="severity"]')
      .select('Critical');
    
    cy.get('select[aria-label="type"]')
      .select('Functional');
    
    cy.get('input#visibleToCustomers')
      .check();

    cy.get('select[aria-label="taskRelated"]')
      .select('TASK PRUEBA COMENTARIOS CYPRESS');
    
    cy.get('select[aria-label="userstoryrelated"]')
      .select('USER STORY PRUEBA COMENTARIOS CYPRESS');
    
    cy.get('select[aria-label="sprint"]')
      .select('Sprint PRUEBA');

    cy.get('select[aria-label="newAssignee"]')
      .select('Raymundo Medina Arzola');
    
    cy.get('input[placeholder="Add a step to reproduce the bug"]')
      .type('1. Open the application\n2. Try saving the form');
    
    cy.get('input[placeholder="Add affected component"]')
      .type('User login form');
    
    cy.get('input[placeholder="Add tag"]')
      .type('Bug, Critical');
    
    cy.get('input[placeholder="Add related bug ID"]')
      .type('BUG-12345');
    
    cy.get('input[placeholder="Bug ID this duplicates"]')
      .type('BUG-98765');
    
    cy.get('input[placeholder="0"]')
      .clear()
      .type('100');  

    cy.get('input#isRegression')
      .check();

    cy.get('button[type="submit"]')
      .click();
  
  })
})