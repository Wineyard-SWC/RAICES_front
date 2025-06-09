describe('User can assign a sprint to an existing Bug', () => {
  it('User can assign a sprint to an existing Bug', () => {

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


      //Editar titulo en el textarea
      cy.get('input[placeholder="Enter bug title"]')
        .clear()
        .type('BUG PRUEBA EDICION');
      //Editar descripcion en el textarea
      cy.get('textarea[placeholder="Enter bug description"]')
        .clear()
        .type('BUG PRUEBA EDICION');
      
      //Editar valor de la prioridad
      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Priority:') 
      .parent() 
      .find('select[aria-label="priority"]') 
      .then(($select) => {
        const value = $select.find('option').not(':first').first().val();
        if (value !== undefined) {
          cy.wrap($select).select(value as string);
        }
      });

      //Editar valor de la severidad del bug
      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Severity:') 
      .parent() 
      .find('select[aria-label="severity"]') 
      .then(($select) => {
        const value = $select.find('option').not(':first').first().val();
        if (value !== undefined) {
          cy.wrap($select).select(value as string);
        }
      });
      
      //Editar valor del tipo del bug
      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Bug Type:') 
      .parent() 
      .find('select[aria-label="type"]') 
      .then(($select) => {
        const value = $select.find('option').not(':first').first().val();
        if (value !== undefined) {
          cy.wrap($select).select(value as string);
        }
      });

      //Editar valor del tipo de status del bug      
      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Bug Status:') 
      .parent() 
      .find('select[aria-label="bugStatus"]') 
      .then(($select) => {
        const value = $select.find('option').not(':first').first().val();
        if (value !== undefined) {
          cy.wrap($select).select(value as string);
        }
      });
      
      //Editar valor del tipo de status del bug en el Kanban
      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Kanban Status:') 
      .parent() 
      .find('select[aria-label="status_khanban"]') 
      .then(($select) => {
        const value = $select.find('option').not(':first').first().val();
        if (value !== undefined) {
          cy.wrap($select).select(value as string);
        }
      });


      cy.contains('button', ' Save Changes').click();
      cy.wait(4000);
  })
})