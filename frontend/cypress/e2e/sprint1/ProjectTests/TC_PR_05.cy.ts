describe('Validar que un usuario con permisos adecuados pueda unirse a un proyecto y quede registrado como miembro.', () => {
  before(() => {
    cy.login()

  });

  it('Aparece el proyecto al que se unió', () => {
    cy.get('.my-6 > .flex-col > :nth-child(2)').click()
    cy.get('.p-6 > form > .w-full').click().clear().type('57F03GNG')
    cy.wait(1000);
    cy.contains('button', 'Next').should('be.visible').click();
    cy.contains('button', 'Accept Invitation').should('be.visible').click();
    cy.wait(1000);
    cy.contains('You have successfully joined the project!').should('be.visible')
  })
})