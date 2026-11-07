/** Tests of the initial language rule: the website preference, then the browser, then English. */

import { describe, expect, it } from 'vitest'
import { createMemoryStorage } from '../core/storage'
import { detectLanguage } from './i18n'

describe('detectLanguage', () => {
  it.each([
    ['es', 'en-US', 'es'],
    ['en', 'es-ES', 'en'],
    ['es-ES', 'en-US', 'es'],
  ])('prefers the website preference %s over the browser language %s', (saved, browser, expected) => {
    const storage = createMemoryStorage()
    storage.setItem('lang', saved)
    expect(detectLanguage(storage, browser)).toBe(expected)
  })

  it.each([
    ['es-ES', 'es'],
    ['en-GB', 'en'],
    ['fr-FR', 'en'],
  ])('uses the browser language %s when the website has not saved one', (browser, expected) => {
    expect(detectLanguage(createMemoryStorage(), browser)).toBe(expected)
  })

  it('moves on to the browser when the saved language is not one of the game', () => {
    const storage = createMemoryStorage()
    storage.setItem('lang', 'fr')
    expect(detectLanguage(storage, 'es-ES')).toBe('es')
  })

  it('moves on to the browser when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('Storage is blocked')
      },
    }
    expect(detectLanguage(blocked, 'es-ES')).toBe('es')
  })
})
