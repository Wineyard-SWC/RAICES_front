import React from 'react'
import { mount } from 'cypress/react'
import Navbar from '@/components/NavBar'
import * as nextNav from 'next/navigation'

describe('Navbar Component', () => {
  let pushStub: Cypress.Agent<sinon.SinonStub>
  let getParamStub: sinon.SinonStub

  beforeEach(() => {
    pushStub = cy.stub().as('push')
    cy.stub(nextNav, 'useRouter').returns({ push: pushStub })

    getParamStub = cy.stub().returns(null)
    cy.stub(nextNav, 'useSearchParams').returns({ get: getParamStub } as any)
    cy.stub(nextNav, 'usePathname').returns('/projects')
  })

  it('desactiva todas las pestañas salvo "Projects" si no hay proyecto seleccionado', () => {
    mount(<Navbar projectSelected={false} />)

    cy.contains('Projects').should('not.be.disabled')
    TABS.filter(t => t !== 'Projects').forEach(tab => {
      cy.contains(tab).should('be.disabled')
    })
  })

  it('navega correctamente cuando hago click en cada pestaña con projectSelected=true', () => {
    cy.window().then(win => win.localStorage.setItem('currentProjectId', 'abc123'))

    mount(<Navbar projectSelected={true} />)

    cy.contains('Dashboard').click()
    cy.get('@push').should('have.been.calledWith', '/dashboard?projectId=abc123')

    cy.contains('Roadmap').click()
    cy.get('@push').should('have.been.calledWith', '/roadmap?projectId=abc123')

    cy.contains('Team').click()
    cy.get('@push').should('have.been.calledWith', '/team?projectId=abc123')
  })

  it('muestra y oculta el dropdown de Generate', () => {
    // con proyecto seleccionado
    cy.window().then(win => win.localStorage.setItem('currentProjectId', 'xyz'))
    mount(<Navbar projectSelected={true} />)

    cy.get('button[aria-label="Mostrar opciones de generación"]').click()

    cy.contains('Generate Requirements').should('be.visible')

    cy.get('body').click(0,0)
    cy.contains('Generate Requirements').should('not.exist')
  })

  it('marca como activa la pestaña según la ruta', () => {
    (nextNav.usePathname as any).returns('/team')
    mount(<Navbar projectSelected={true} />)

    cy.contains('Team')
      .should('have.class', 'bg-[#4a2b4a]')
  })
})

const TABS = ["Dashboard","Projects","Roadmap","Team","Generate"]
