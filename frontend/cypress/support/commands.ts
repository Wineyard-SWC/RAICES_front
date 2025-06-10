/// <reference types="cypress" />

require("@4tw/cypress-drag-drop");

Cypress.Commands.add('login', () => {
    cy.fixture('loginInfo').then((user) => {
      cy.visit('https://raices-eta.vercel.app/login'); // Cambia la ruta si es diferente
      cy.get('#email').type(user.verifiedMail)
      cy.get('#password').type(user.verifiedPassword)
      cy.get('.inline-flex').click()
    });
  });
  
  declare global {
    namespace Cypress {
      interface Chainable {
        /**
         * Custom command to log in using fixture data.
         * @example cy.login()
         */
        login(): Chainable<void>;
      }
    }
  }
  
Cypress.Commands.add('loginForBiometrics', () => {
    cy.fixture('loginInfo').then((user) => {
      cy.visit('https://raices-eta.vercel.app/login'); // Cambia la ruta si es diferente
      cy.get('#email').type(user.verifiedMailBio)
      cy.get('#password').type(user.verifiedPasswordBio)
      cy.get('.inline-flex').click()
    });
  });
  
  declare global {
    namespace Cypress {
      interface Chainable {
        /**
         * Custom command to log in using fixture data.
         * @example cy.login()
         */
        loginForBiometrics(): Chainable<void>;
      }
    }
  }
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }