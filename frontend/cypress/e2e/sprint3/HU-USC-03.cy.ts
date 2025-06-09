describe('Comments ordered by date', () => {
  it('Comments are ordered by date', () => {
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

      cy.contains('p', 'Comments')
        .closest('div.bg-white.p-3.rounded-lg.shadow-sm') 
        .find('div[class*="bg-[#F5F0F1] border border-gray-200 p-2 rounded-md relative"]')  
        .then(($comments) => {

          const commentDates: number[] = [];
          
          $comments.each((index, comment) => {
            const commentDateText = Cypress.$(comment).find('span').text();
            const commentDate = new Date(commentDateText.split('·')[1].trim());  
            commentDates.push(commentDate.getTime());  
          });

          const sortedDates = [...commentDates].sort((a, b) => a - b);  

          commentDates.forEach((date, index) => {
            expect(date).to.equal(sortedDates[index]);  
          });
      });
  })
})