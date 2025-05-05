describe('Verificar que el botón de borrar proyecto elimine correctamente un proyecto y solicite confirmación antes de proceder.', () => {
  before(() => {
    cy.login()

  });

  it('Se elimina el proyecto y se muestra borrado exitosamente', () => {
    cy.get(':nth-child(3) > .shadow-md > .flex-col > .justify-between > .project-menu > .text-gray-500 > .lucide').click()
    cy.get('.text-red-600').click()
    cy.get('.bg-red-600').click()
    cy.contains('Project deleted successfully').should('be.visible')
    
  })
})