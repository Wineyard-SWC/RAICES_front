Cypress.config("defaultCommandTimeout",40000)

describe('Moving items test', () => {
    it('Move items btween columns', () => {
        cy.login();
        cy.wait(2000)
        cy.get('.grid-cols-1 > :nth-child(1) > .bg-white').click()
        cy.wait(3000)
        
        cy.get('[data-rfd-draggable-id="14064999-505a-482e-96cc-2d0386646162"]').then($el => {
            const rect = $el[0].getBoundingClientRect();
            const startX = rect.x + (rect.width / 2);
            const startY = rect.y + (rect.height / 2);
            
            // Secuencia más detallada con pequeños incrementos
            cy.get('[data-rfd-draggable-id="14064999-505a-482e-96cc-2d0386646162"]')
              .trigger('mousedown', { button: 0, clientX: startX, clientY: startY })
              .wait(100)
              .trigger('mousemove', { clientX: startX + 25, clientY: startY, force: true })
              .wait(100)
              .trigger('mousemove', { clientX: startX + 50, clientY: startY, force: true })
              .wait(100)
              .trigger('mousemove', { clientX: startX + 75, clientY: startY, force: true })
              .wait(100)
              .trigger('mousemove', { clientX: startX + 100, clientY: startY, force: true })
              .wait(100)
              .trigger('mouseup', { force: true });
        });
    })
})