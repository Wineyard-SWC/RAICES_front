describe('User can only assign a valid priority to an existing Bug', () => {
  it('User can only assign a valid priority to an existing Bug', () => {

      const validPriorities = ["High","Medium","Low"];

      cy.login();
      cy.wait(10000);
      cy.login();
      cy.wait(10000);


      cy.contains('h2', 'EcoHuerto Urbano Comunitario - Plataforma de Gestión').click();
      cy.wait(4000);

      cy.contains('button', 'View full Backlog').click();
      cy.wait(4000);

      cy.contains('h3', 'BUG PRUEBA EDICION').click();
      cy.wait(4000);
      
      cy.contains('button', ' Edit').click();
      cy.wait(4000);

      //Editar valor de la prioridad
      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Priority:') 
      .parent() 
      .find('select[aria-label="priority"]') 
      .then(($select) => {
        
        const options = $select.find('option').toArray().map(option => (option as HTMLOptionElement).value);

        const validPrioritiesExist = options.every(option => validPriorities.includes(option));

        if (validPrioritiesExist) {
          const value = $select.find('option').not(':first').first().val();
          if (value !== undefined) {
            cy.wrap($select).select(value);
          }
        } 
        else {
          cy.log('Error: Options not valid in the select form');
        }
      }); 
  })
})