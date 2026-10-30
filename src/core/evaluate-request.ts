import type { ApiRequest } from './http'
import type { Mission, RequestField } from './missions'

export type EvaluationIssueCode =
  | 'method'
  | 'path'
  | 'query-missing'
  | 'query-unexpected'
  | 'header-missing'
  | 'header-unexpected'
  | 'body-missing'
  | 'body-invalid-json'
  | 'body-mismatch'

export interface EvaluationIssue {
  code: EvaluationIssueCode
  field: RequestField
  expected?: string
  received?: string
  key?: string
}

export interface EvaluationResult {
  correct: boolean
  issues: EvaluationIssue[]
}

function normalizePath(path: string): string {
  const trimmed = path.trim().split('?')[0]
  if (!trimmed) return '/'
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}

function entriesToRecord(entries: Array<{ key: string; value: string }>, caseInsensitive = false) {
  return entries.reduce<Record<string, string>>((result, entry) => {
    const key = caseInsensitive ? entry.key.trim().toLowerCase() : entry.key.trim()
    if (key) result[key] = entry.value.trim()
    return result
  }, {})
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, stableValue(child)]),
    )
  }
  return value
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
}

function compareRecord(
  expected: Record<string, string>,
  received: Record<string, string>,
  field: 'query' | 'header',
): EvaluationIssue[] {
  const missingCode = field === 'query' ? 'query-missing' : 'header-missing'
  const unexpectedCode = field === 'query' ? 'query-unexpected' : 'header-unexpected'
  const issueField = field === 'query' ? 'query' : 'headers'
  const issues: EvaluationIssue[] = []

  for (const [key, value] of Object.entries(expected)) {
    if (received[key] !== value) {
      issues.push({ code: missingCode, field: issueField, key, expected: value, received: received[key] })
    }
  }

  for (const [key, value] of Object.entries(received)) {
    if (!(key in expected)) {
      issues.push({ code: unexpectedCode, field: issueField, key, received: value })
    }
  }

  return issues
}

export function evaluateRequest(mission: Mission, request: ApiRequest): EvaluationResult {
  const issues: EvaluationIssue[] = []
  const expected = mission.expectation

  if (request.method !== expected.method) {
    issues.push({ code: 'method', field: 'method', expected: expected.method, received: request.method })
  }

  if (normalizePath(request.path) !== normalizePath(expected.path)) {
    issues.push({ code: 'path', field: 'path', expected: expected.path, received: request.path })
  }

  issues.push(...compareRecord(expected.query ?? {}, entriesToRecord(request.query), 'query'))
  issues.push(
    ...compareRecord(
      Object.fromEntries(Object.entries(expected.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])),
      entriesToRecord(request.headers, true),
      'header',
    ),
  )

  const expectsBody = expected.body !== undefined || expected.acceptedBodies !== undefined
  if (expectsBody && !request.body.trim()) {
    issues.push({ code: 'body-missing', field: 'body' })
  } else if (expectsBody) {
    try {
      const receivedBody = JSON.parse(request.body) as unknown
      const accepted = expected.acceptedBodies ?? [expected.body]
      if (!accepted.some((body) => sameJson(body, receivedBody))) {
        issues.push({ code: 'body-mismatch', field: 'body' })
      }
    } catch {
      issues.push({ code: 'body-invalid-json', field: 'body' })
    }
  } else if (request.body.trim()) {
    issues.push({ code: 'body-mismatch', field: 'body', received: request.body })
  }

  return { correct: issues.length === 0, issues }
}
