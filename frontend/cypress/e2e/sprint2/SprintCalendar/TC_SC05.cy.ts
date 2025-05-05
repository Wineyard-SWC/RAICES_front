describe('Filter by properties test', () => {
    it('Filtered by properties succesfully', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get(':nth-child(1) > .mt-auto > .inline-flex').click()
      cy.get('.inline-flex > .relative').click()
      cy.get('.gap-2 > .h-9').select('In Review')
      cy.get('.file\:text-foreground').type('Configure')

    })
  })    