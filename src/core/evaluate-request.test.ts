import { describe, expect, it } from 'vitest'
import type { Mission } from './missions'
import { evaluateRequest } from './evaluate-request'

const mission: Mission = {
  id: 'test',
  chapter: 1,
  order: 1,
  title: { en: 'Test', es: 'Prueba' },
  brief: { en: 'Test', es: 'Prueba' },
  objective: { en: 'Test', es: 'Prueba' },
  service: 'Users API',
  availableFields: ['method', 'path', 'query', 'headers', 'body'],
  expectation: {
    method: 'POST',
    path: '/users',
    query: { notify: 'true' },
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'Ana', active: true },
  },
  successResponse: { status: 201, statusText: 'Created' },
  hints: [],
  explanation: { en: 'Done', es: 'Hecho' },
  concepts: ['POST'],
  xp: 100,
}

describe('evaluateRequest', () => {
  it('accepts semantic JSON and case-insensitive header names', () => {
    const result = evaluateRequest(mission, {
      method: 'POST',
      path: 'users/',
      query: [{ id: '1', key: 'notify', value: 'true' }],
      headers: [{ id: '2', key: 'content-type', value: 'application/json' }],
      body: '{"active":true,"name":"Ana"}',
    })
    expect(result).toEqual({ correct: true, issues: [] })
  })

  it('reports every independent request problem', () => {
    const result = evaluateRequest(mission, {
      method: 'GET',
      path: '/products',
      query: [],
      headers: [],
      body: '{bad json}',
    })
    expect(result.correct).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toEqual([
      'method',
      'path',
      'query-missing',
      'header-missing',
      'body-invalid-json',
    ])
  })
})
