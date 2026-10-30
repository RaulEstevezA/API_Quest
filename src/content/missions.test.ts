import { describe, expect, it } from 'vitest'
import { missions } from './missions'

describe('mission catalogue', () => {
  it('has unique IDs and ordered missions', () => {
    expect(new Set(missions.map((mission) => mission.id)).size).toBe(missions.length)
    expect(missions.every((mission) => mission.order > 0)).toBe(true)
  })

  it('provides bilingual learning content', () => {
    for (const mission of missions) {
      expect(mission.title.en).not.toBe('')
      expect(mission.title.es).not.toBe('')
      expect(mission.explanation.en).not.toBe('')
      expect(mission.explanation.es).not.toBe('')
      expect(mission.hints.length).toBeGreaterThan(0)
    }
  })
})
