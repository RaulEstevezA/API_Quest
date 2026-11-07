/** Consistency tests of the story: every chapter has a complete prologue in both languages. */

import { describe, expect, it } from 'vitest'
import { chapters } from './chapters'
import { prologues } from './prologues'

describe('prologues', () => {
  it.each(chapters.map((chapter) => chapter.id))('tells chapter %i in both languages', (id) => {
    const prologue = prologues[id]
    for (const text of [prologue.signal, prologue.title, prologue.quote, prologue.action]) {
      expect(text.en).not.toBe('')
      expect(text.es).not.toBe('')
    }
    expect(prologue.paragraphs.en.length).toBeGreaterThan(0)
    expect(prologue.paragraphs.es).toHaveLength(prologue.paragraphs.en.length)
  })
})
