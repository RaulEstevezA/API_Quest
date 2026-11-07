/**
 * Interface tests of the requirements that span several components: the website
 * header and the destinations of the main menu, language persistence and the storage warnings.
 */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { missions } from '../content/missions'
import { completeMission, createInitialProgress, PROGRESS_STORAGE_KEY, saveProgress } from '../core/progress'
import { createSandboxState, SANDBOX_KEY, saveSandbox } from '../core/sandbox/state'
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

function click(element: Element | null | undefined) {
  act(() => element?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
}

/** Clicks an entry of the main menu by its visible text. */
function openFromMenu(label: string) {
  const entry = [...container.querySelectorAll('nav .button')].find((button) => button.textContent === label)
  act(() => entry?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
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

  it('offers every destination of the game in its menu', () => {
    renderApp(returningPlayerStorage())
    const entries = [...container.querySelectorAll('nav .button')].map((entry) => entry.textContent)
    expect(entries).toEqual(['Missions', 'Docs', 'Sandbox', 'Achievements', 'How to play', 'Reset progress', 'Games'])
  })

  it('shows the XP marker on the mission list only', () => {
    renderApp(returningPlayerStorage())
    expect(container.querySelector('.progress-summary')).toBeNull()
    openFromMenu('Missions')
    expect(container.querySelector('.progress-summary')).not.toBeNull()
  })

  it('offers to continue once the player has progress, and opens the first pending mission', () => {
    const storage = returningPlayerStorage()
    saveProgress(storage, completeMission(createInitialProgress(), 'first-request-1', 100, 1, 0))
    renderApp(storage)
    openFromMenu('Continue')
    expect(container.querySelector('h1')?.textContent).toBe('Find user 42')
  })

  it.each(['Missions', 'Docs', 'Sandbox', 'Achievements'])(
    'hides the header and the menu on %s and offers the way back',
    (destination) => {
      renderApp(returningPlayerStorage())
      openFromMenu(destination)
      expect(container.querySelector('header')).toBeNull()
      expect(container.querySelector('nav')).toBeNull()
      expect(container.querySelector('.title-screen__logo')).toBeNull()
      const back = container.querySelector('.screen-bar button')
      expect(back?.textContent).toBe('← Menu')
      act(() => back?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
      expect(container.querySelector('header')).not.toBeNull()
    },
  )

  it('changes the language of the interface and saves it for the website', () => {
    const storage = returningPlayerStorage()
    renderApp(storage)
    const spanish = [...container.querySelectorAll('header button')].find((button) => button.textContent === 'ES')
    act(() => spanish?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(container.querySelector('nav .button')?.textContent).toBe('Misiones')
    expect(document.documentElement.lang).toBe('es')
    expect(storage.getItem('lang')).toBe('es')
  })

  it('keeps the page position and the focus on the selector when the language changes', () => {
    renderApp(returningPlayerStorage())
    const spanish = [...container.querySelectorAll('header button')].find(
      (button): button is HTMLButtonElement => button.textContent === 'ES',
    )
    spanish?.focus()
    vi.mocked(window.scrollTo).mockClear()
    click(spanish)
    expect(document.activeElement).toBe(spanish)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('offers the ending once every mission is complete', () => {
    const storage = returningPlayerStorage()
    const finished = missions.reduce(
      (progress, mission) => completeMission(progress, mission.id, 100, 1, 0),
      createInitialProgress(),
    )
    saveProgress(storage, finished)
    renderApp(storage)
    openFromMenu('Ending')
    expect(container.querySelector('#ending-title')?.textContent).toBe('Shift complete')
    expect(container.querySelector('.ending__art')?.getAttribute('src')).toContain('chapters/ending.webp')
    expect(container.querySelector('header')).toBeNull()
  })

  it('tells the story of a chapter the first time only, and lets the player reread it', () => {
    const storage = returningPlayerStorage()
    renderApp(storage)
    openFromMenu('Missions')
    expect(container.querySelector('.prologue')).toBeNull()
    click(container.querySelector('.mission-tile'))
    expect(container.querySelector('.modal.chapter-theme .modal__header h2')?.textContent).toBe('First night')
    click(container.querySelector('.modal.chapter-theme .modal__actions .button--primary'))
    expect(container.querySelector('.prologue')).toBeNull()
    expect(storage.getItem('api-quest.prologues-seen')).toBe('[1]')

    click(container.querySelector('.screen-bar .button'))
    click([...container.querySelectorAll('.chapter-card button')].find((button) => button.textContent === 'Briefing'))
    expect(container.querySelector('.prologue')).not.toBeNull()
  })

  it('opens the API reference in a window without leaving the mission', () => {
    renderApp(returningPlayerStorage())
    openFromMenu('Missions')
    click(container.querySelector('.mission-tile'))
    click([...container.querySelectorAll('.screen-bar button')].find((button) => button.textContent === 'Docs'))
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    expect(container.querySelector('.workspace')).not.toBeNull()
    expect(container.querySelector('dialog.modal--wide .docs__grid')).not.toBeNull()
  })

  it('shows the lights saved by the Sandbox in the background', () => {
    const storage = returningPlayerStorage()
    saveSandbox(storage, { ...createSandboxState(), lights: 'off' })
    renderApp(storage)
    expect(container.querySelector('.backdrop--lights-off')).not.toBeNull()
  })

  it('warns on the Sandbox screen when its saved data could not be restored', () => {
    const storage = returningPlayerStorage()
    storage.setItem(SANDBOX_KEY, '{not json')
    renderApp(storage)
    openFromMenu('Sandbox')
    expect(container.querySelector('[role="status"]')?.textContent).toContain('could not be restored')
  })

  it('hides a secret achievement until it is earned', () => {
    const storage = returningPlayerStorage()
    renderApp(storage)
    openFromMenu('Achievements')
    expect(container.textContent).toContain('???')
    expect(container.textContent).not.toContain('Night Shift')
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
