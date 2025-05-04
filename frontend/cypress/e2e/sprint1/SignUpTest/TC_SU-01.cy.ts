describe('Normal SignUp test', () => {
  it('passes', () => {
    cy.visit('/signup')
   // cy.get('text-[#4A2B4D]').click()
   
   //cy.contains('Sign up').click()
   cy.wait(100)
   cy.fixture('signupInfo').then((user) => {
    cy.get('.space-y-4 > :nth-child(1) > .w-full').type(user.Fname)
    cy.get('.space-y-4 > :nth-child(2) > .w-full').type(user.Lname)
    cy.get(':nth-child(4) > .w-full').type(user.Email)
    cy.get(':nth-child(5) > .relative > .w-full').type(user.Password)
    cy.get(':nth-child(6) > .relative > .w-full').type(user.Password)
    cy.get('#terms').click()
    cy.get('.max-w-sm > .text-white').click()
  })
})
})
