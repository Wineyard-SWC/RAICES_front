describe('Validar que el botón de filtros permita aplicar condiciones para actualizar la lista probando el criterio "Activo".', () => {
  before(() => {
    cy.login();
  });

  it('Se muestran solo los proyectos que cumplan con el filtro "Activo"', () => {
    
    cy.get('.my-6 > .flex-col > .relative > .flex').click();

    cy.get('.py-1 > :nth-child(2)').click();

    // 1) Selecciona todas las tarjetas:
    cy.get('.bg-white.flex-col.justify-between')
    // 2) Recorre cada una:
    .each(($tarjeta) => {
      // 3) Comprueba que dentro de esa tarjeta haya "Active"
      cy.wrap($tarjeta).should('contain.text', 'Active')
    })

  });
});
