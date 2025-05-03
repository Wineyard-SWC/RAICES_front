describe('Fake login test', () => {
    it('should not allow login with fake email', () => {
        cy.visit('/login')
        cy.fixture('loginInfo').then((user) => {
            cy.get('#email').type(user.falseMail)
            cy.get('#password').type(user.falsePassword)
            cy.get('.inline-flex').click()
        })
    })
})