describe('User can view the graphic data of its mood through the history of biometric sessions', () => {
  it('User can view the graphic data of its mood through the history of biometric sessions', () => {
    cy.loginForBiometrics()
    cy.wait(10000);
    cy.loginForBiometrics()
    cy.wait(10000);

    cy.contains('h2', 'RAICES').click();
    cy.wait(6000);

    cy.contains('button','View Biometrics').click();
    cy.wait(4000);

    cy.contains('button','Mood').click();


    cy.get('div[title*="Session"]')
      .should('have.length.at.least', 0)
      .each(($bar, index) => {
        cy.wrap($bar)
          .should('have.css', 'background-color', 'rgb(16, 185, 129)')
          .should('have.css', 'opacity', '0.8')
          .and(($el) => {
            const title = $el.attr('title');
            expect(title).to.match(/Session \d+: -?\d+\.\d+/);
              
            const heightStyle = $el.attr('style');
            expect(heightStyle).to.include('height:');
              
            const heightMatch = heightStyle?.match(/height:\s*(\d+(?:\.\d+)?)%/);
            if (heightMatch) {
                const height = parseFloat(heightMatch[1]);
                expect(height).to.be.at.least(0);
              }
          });
      });
  })
})