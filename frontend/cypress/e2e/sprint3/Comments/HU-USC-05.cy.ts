describe('User can not delete another user comments', () => {
  it('User can not delete another user comments', () => {

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

      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
        .find('div[class*="bg-[#F5F0F1] border border-gray-200 p-2 rounded-md relative"]') 
        .each(($comment, index) => {
          const commentText = $comment.find('p.text-black').text(); 
          const userName = $comment.find('strong').text(); 
          
          if (userName !== "Raymundo Medina Arzola") {
            cy.wrap($comment)
              .find('button[aria-label="Delete Comment"]')
              .should('not.exist');  

            cy.log(`Comentario ${index}: ${commentText} no es de mi usuario y no poder eliminarlo.`);
          } else {
            cy.wrap($comment)
              .find('button[aria-label="Delete Comment"]')
              .should('exist');    

            cy.log(`Comentario ${index}: ${commentText} es de mi usuario y se puede eliminar.`);
          }
      });
  })
})