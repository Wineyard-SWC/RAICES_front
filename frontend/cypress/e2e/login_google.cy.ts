describe('Login con Google', () => {
  it('Debería redirigir al login de Google', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Google').click();

    cy.url().should('include', 'accounts.google.com');
  });
});