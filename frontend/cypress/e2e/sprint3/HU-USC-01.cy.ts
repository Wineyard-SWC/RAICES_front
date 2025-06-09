describe('Comments in product backlog kanban items', () => {
    it('Comment succesfully added', () => {
      cy.login();
      cy.wait(10000);
      cy.login();
      cy.wait(10000);


      cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

      cy.contains('button', 'View full Backlog').click();
      cy.wait(4000);

      //Opcion 1 Tarea
      cy.contains('h3', 'TASK PRUEBA COMENTARIOS CYPRESS').click();
      cy.wait(4000);
      
      //Opcion 2 Historia de usuario
      /*
      cy.contains('h3', 'USER STORY PRUEBA COMENTARIOS CYPRESS').click();
      cy.wait(4000);
      */

      cy.get('textarea[placeholder="Write your comment here..."]')
        .type('COMMENTARIO PARA PRUEBA CYPRESS');
      cy.wait(2000);
      
      cy.contains('button', 'Add Comment').click();
      cy.wait(4000);
    })
  })    