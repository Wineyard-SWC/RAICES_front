describe('User can see biometric data related to his previous biometric sessions', () => {
  it('User can see biometric data related to his previous biometric sessions', () => {
      cy.loginForBiometrics()
      cy.wait(10000);
      cy.loginForBiometrics()
      cy.wait(10000);

      cy.contains('h2', 'RAICES').click();
      cy.wait(4000);

      cy.contains('button','View Biometrics').click();
      cy.wait(1000);

      cy.contains('p','Completed Sessions')
        .should('exist')
      cy.contains('p','Average Stress')
        .should('exist')
      cy.contains('p','Average Energy Level')
        .should('exist')
      cy.contains('p','Average HR')
        .should('exist')
  })
})