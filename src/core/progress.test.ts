import { describe, expect, it } from 'vitest'
import { calculateXp } from './scoring'
import {
  completeMission,
  createInitialProgress,
  loadProgress,
  PROGRESS_STORAGE_KEY,
  saveProgress,
  type StorageAdapter,
} from './progress'

function memoryStorage(): StorageAdapter {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
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
    expect(loadProgress(storage)).toEqual(progress)
  })

  it('falls back safely for incompatible data', () => {
    const storage = memoryStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, '{"version":99}')
    expect(loadProgress(storage)).toEqual(createInitialProgress())
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
