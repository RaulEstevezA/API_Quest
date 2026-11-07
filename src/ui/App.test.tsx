/**
 * Interface tests of the requirements that span several components: the website
 * header in the initial menu, language persistence and the storage warnings.
 */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PROGRESS_STORAGE_KEY } from '../core/progress'
import { createMemoryStorage, type StorageAdapter } from '../core/storage'
import { App } from './App'

// Tells React that updates in these tests are wrapped in `act`.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLElement
let root: Root

/** Builds a store where the player has already seen the onboarding dialog. */
function returningPlayerStorage(): StorageAdapter {
  const storage = createMemoryStorage()
  storage.setItem('api-quest.onboarding-seen', 'true')
  storage.setItem('lang', 'en')
  return storage
}

function renderApp(storage: StorageAdapter) {
  act(() => root.render(<App storage={storage} />))
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  window.scrollTo = vi.fn()
  // jsdom does not implement modal dialogs.
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('initial menu', () => {
  it('shows the website header with only the name link and the language selector', () => {
    renderApp(returningPlayerStorage())
    const header = container.querySelector('header')
    expect(header?.querySelector('a')?.getAttribute('href')).toBe('https://raulesteveza.github.io/')
    expect(header?.querySelector('a')?.textContent).toBe('Raúl Estévez')
    expect([...(header?.querySelectorAll('button') ?? [])].map((button) => button.textContent)).toEqual(['EN', 'ES'])
    expect(header?.querySelector('nav')).toBeNull()
  })

  it('changes the language of the interface and saves both preferences', () => {
    const storage = returningPlayerStorage()
    renderApp(storage)
    const spanish = [...container.querySelectorAll('header button')].find((button) => button.textContent === 'ES')
    act(() => spanish?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(container.querySelector('#chapters-title')?.textContent).toBe('Capítulos')
    expect(document.documentElement.lang).toBe('es')
    expect(storage.getItem('api-quest.language')).toBe('es')
    expect(storage.getItem('lang')).toBe('es')
  })

  it('tells the player when saved progress could not be restored', () => {
    const storage = returningPlayerStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, '{"version":99}')
    renderApp(storage)
    expect(container.querySelector('[role="status"]')?.textContent).toContain('could not be restored')
  })

  it('keeps working and warns the player when storage is blocked', () => {
    const fail = () => {
      throw new Error('Storage is blocked')
    }
    renderApp({ getItem: fail, setItem: fail, removeItem: fail })
    expect(container.querySelector('h1')?.textContent).toBe('API Quest')
    expect(container.querySelector('[role="status"]')?.textContent).toContain('local storage is unavailable')
  })
})
