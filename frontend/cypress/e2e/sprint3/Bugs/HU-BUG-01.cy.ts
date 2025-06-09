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

      cy.contains('h3', 'BUG PRUEBA COMENTARIOS CYPRESS').click();
      cy.wait(4000);
      
      cy.contains('button', ' Edit').click();
      cy.wait(4000);

      cy.get('div.bg-white.p-3.rounded-lg.shadow-sm') 
      .contains('p.font-semibold', 'Sprint:') 
      .parent() 
      .find('select[aria-label="sprint"]') 
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