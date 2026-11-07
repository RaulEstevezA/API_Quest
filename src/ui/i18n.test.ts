/** Tests of the initial language rule: inherit from the website, otherwise English. */

import { describe, expect, it } from 'vitest'
import { createMemoryStorage } from '../core/storage'
import { detectLanguage } from './i18n'

describe('detectLanguage', () => {
  it.each([
    ['es', 'es'],
    ['en', 'en'],
    ['es-ES', 'es'],
    ['fr', 'en'],
  ])('reads the website preference %s as %s', (saved, expected) => {
    const storage = createMemoryStorage()
    storage.setItem('lang', saved)
    expect(detectLanguage(storage)).toBe(expected)
  })

  it('uses English when the website has not saved a language', () => {
    expect(detectLanguage(createMemoryStorage())).toBe('en')
  })

  it('uses English when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('Storage is blocked')
      },
    }
    expect(detectLanguage(blocked)).toBe('en')
  })
})
