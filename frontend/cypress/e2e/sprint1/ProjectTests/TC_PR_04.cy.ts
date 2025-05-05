describe('Verificar que, al presionar el botón para añadir, se permita agregar usuarios de manera correcta.', () => {
  before(() => {
    cy.login()

  });

  it('Se agregan los usuarios', () => {
    cy.get('.my-6 > .flex-col > :nth-child(3)').click()
    cy.get(':nth-child(7) > .relative > .w-full').click().clear().type('abdiel')
    cy.wait(2000);
    cy.get('ul > .p-2').click()
    cy.contains('abdiel').should('be.visible')
  })
})