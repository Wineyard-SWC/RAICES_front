describe('Epics Generation Test', () => {
    it('Epics are created succesfully', () => {
      cy.login();
      cy.wait(6000);
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.get('.rounded-r-none').click()
      cy.get('.grid > :nth-child(1) > a > .justify-center').click()
      cy.fixture('requirementContext').then((user) => {
        cy.get('.p-3').type(user.ValidProjectContext)
      })
      cy.contains('Generate Requirements').click()
      cy.wait(60000)
      cy.wait(2000)
      cy.get('.mt-auto > :nth-child(1) > .lucide').click()
      cy.get('[href="/gen_epics"] > .px-4').click()
      cy.get('.space-x-4> .flex > .text-white').click()
    })
  })    