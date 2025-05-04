describe('Search items by name', () => {
    it('Items searched by name displayed succesfully', () => {
      cy.login();
      cy.wait(2000)
      cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
      cy.wait(2000)
      cy.get('input').type('Display')
    })
  })    