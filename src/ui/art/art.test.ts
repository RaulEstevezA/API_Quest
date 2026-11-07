/** Tests of the pixel art: grids must be well formed, and the scene must be stable between renders. */

import { describe, expect, it } from 'vitest'
import { chapterEmblems, lockEmblem, medalEmblem } from './emblems'
import { gridToPath } from './PixelArt'
import { buildServerRoom } from './server-room'

describe('emblems', () => {
  it.each(Object.entries({ ...chapterEmblems, lock: lockEmblem, medal: medalEmblem }))(
    'draws emblem %s on a 16 x 16 grid',
    (_name, rows) => {
      expect(rows).toHaveLength(16)
      expect(rows.every((row) => row.length === 16)).toBe(true)
    },
  )

  it('joins adjacent pixels of a row into one rectangle', () => {
    expect(gridToPath(['.aa.', '..a.'], 'a')).toBe('M1 0h2v1h-2zM2 1h1v1h-1z')
  })
})

describe('server room', () => {
  it('produces the same scene on every render', () => {
    expect(buildServerRoom()).toEqual(buildServerRoom())
  })
})
