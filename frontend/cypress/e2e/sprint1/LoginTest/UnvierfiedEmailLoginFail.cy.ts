describe('Unverified login test', () => {
    it('should not allow login with unverified email', () => {
        cy.visit('/login')
        cy.fixture('loginInfo').then((user) => {
            cy.get('#email').type(user.unverifiedMail)
            cy.get('#password').type(user.unverifiedPassword)
            cy.get('.inline-flex').click()
        })
    })
})