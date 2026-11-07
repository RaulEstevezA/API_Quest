/** Tests of the progress rules and XP scoring, run against an in-memory store. */

import { describe, expect, it } from 'vitest'
import { calculateXp } from './scoring'
import {
  completeMission,
  createInitialProgress,
  isChapterUnlocked,
  loadProgress,
  PROGRESS_STORAGE_KEY,
  resetProgress,
  saveProgress,
} from './progress'
import { createMemoryStorage as memoryStorage, type StorageAdapter } from './storage'

/** Builds a store that fails like a browser with blocked storage. */
function blockedStorage(): StorageAdapter {
  const fail = () => {
    throw new Error('Storage is blocked')
  }
  return { getItem: fail, setItem: fail, removeItem: fail }
}

describe('progress', () => {
  it('keeps the best score when a mission is replayed', () => {
    const first = completeMission(createInitialProgress(), 'c1-m1', 75, 2, 0)
    const replay = completeMission(first, 'c1-m1', 50, 3, 1)
    expect(replay.xp).toBe(75)
    expect(replay.completedMissions['c1-m1'].bestXp).toBe(75)
    expect(replay.achievements).toContain('http-rookie')
  })

  it('round-trips through browser-like storage', () => {
    const storage = memoryStorage()
    const progress = completeMission(createInitialProgress(), 'c1-m1', 100, 1, 0)
    expect(saveProgress(storage, progress)).toBe(true)
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).not.toBeNull()
    expect(loadProgress(storage)).toEqual({ progress, status: 'restored' })
  })

  it('treats a first visit as new progress', () => {
    expect(loadProgress(memoryStorage())).toEqual({ progress: createInitialProgress(), status: 'new' })
  })

  it.each(['{"version":99}', '{not json', '{"version":1,"xp":0,"completedMissions":null,"achievements":[]}'])(
    'reports a reset instead of losing %s silently',
    (saved) => {
      const storage = memoryStorage()
      storage.setItem(PROGRESS_STORAGE_KEY, saved)
      expect(loadProgress(storage)).toEqual({ progress: createInitialProgress(), status: 'reset' })
    },
  )

  it('keeps working when storage is blocked', () => {
    const storage = blockedStorage()
    expect(loadProgress(storage)).toEqual({ progress: createInitialProgress(), status: 'new' })
    expect(saveProgress(storage, createInitialProgress())).toBe(false)
    expect(resetProgress(storage)).toEqual(createInitialProgress())
  })

  it('unlocks a chapter only after every mission of the previous one', () => {
    const progress = completeMission(createInitialProgress(), 'a', 100, 1, 0)
    expect(isChapterUnlocked(1, [], createInitialProgress())).toBe(true)
    expect(isChapterUnlocked(2, ['a'], progress)).toBe(true)
    expect(isChapterUnlocked(2, ['a', 'b'], progress)).toBe(false)
  })
})

describe('calculateXp', () => {
  it.each([
    [{ attempts: 1, hintsUsed: 0, baseXp: 100 }, 100],
    [{ attempts: 2, hintsUsed: 0, baseXp: 100 }, 75],
    [{ attempts: 3, hintsUsed: 0, baseXp: 100 }, 50],
    [{ attempts: 1, hintsUsed: 1, baseXp: 100 }, 50],
  ])('scores %j as %i XP', (input, expected) => {
    expect(calculateXp(input)).toBe(expected)
  })
})
