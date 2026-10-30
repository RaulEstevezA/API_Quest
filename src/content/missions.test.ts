import { describe, expect, it } from 'vitest'
import { missions } from './missions'
import { evaluateRequest } from '../core/evaluate-request'

describe('mission catalogue', () => {
  it('has unique IDs and ordered missions', () => {
    expect(missions).toHaveLength(56)
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

  it('accepts the documented solution for every mission', () => {
    for (const mission of missions) {
      const expectation = mission.expectation
      const result = evaluateRequest(mission, {
        method: expectation.method,
        path: expectation.path,
        query: Object.entries(expectation.query ?? {}).map(([key, value], index) => ({ id: `q-${index}`, key, value })),
        headers: Object.entries(expectation.headers ?? {}).map(([key, value], index) => ({ id: `h-${index}`, key, value })),
        body: expectation.body === undefined ? '' : JSON.stringify(expectation.body),
      })
      expect(result, mission.id).toEqual({ correct: true, issues: [] })
    }
  })
})
