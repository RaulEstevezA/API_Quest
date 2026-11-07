/**
 * Mission validator (Registry of rules).
 *
 * Each rule checks one part of the request and returns its own issues, so the
 * player receives every independent problem at once instead of one per attempt.
 * To validate something new, write a `RequestRule`, add it to `requestRules`, and
 * add its message in `content/ui-text.ts`, which the compiler then requires.
 */

import type { ApiRequest } from './http'
import type { Mission, MissionExpectation, RequestField } from './missions'

/** Closed list of the problems a request can have. */
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

/** A single problem found in a request, with the data needed to explain it. */
export interface EvaluationIssue {
  code: EvaluationIssueCode
  field: RequestField
  expected?: string
  received?: string
  key?: string
}

/** Verdict on a request. `correct` is true when there are no issues. */
export interface EvaluationResult {
  correct: boolean
  issues: EvaluationIssue[]
}

/** Checks one part of a request and returns the problems found in it. */
type RequestRule = (expected: MissionExpectation, request: ApiRequest) => EvaluationIssue[]

/** Issue codes and request field reported by a key-value comparison. */
interface RecordIssueKinds {
  field: Extract<RequestField, 'query' | 'headers'>
  missing: EvaluationIssueCode
  unexpected: EvaluationIssueCode
}

/** Makes `users`, `/users` and `/users/` equivalent, and ignores any query string typed in the path. */
function normalizePath(path: string): string {
  const trimmed = path.trim().split('?')[0]
  if (!trimmed) return '/'
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}

/** Converts form rows into a record, skipping rows without a key. */
function entriesToRecord(entries: Array<{ key: string; value: string }>, caseInsensitive = false) {
  return entries.reduce<Record<string, string>>((result, entry) => {
    const key = caseInsensitive ? entry.key.trim().toLowerCase() : entry.key.trim()
    if (key) result[key] = entry.value.trim()
    return result
  }, {})
}

/** Sorts object keys recursively, so that key order does not affect a JSON comparison. */
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

/** Compares two JSON values by meaning: key order is irrelevant, as it is in JSON. */
function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
}

/** Reports the keys that are missing, have a wrong value, or should not be there. */
function compareRecord(
  expected: Record<string, string>,
  received: Record<string, string>,
  { field, missing, unexpected }: RecordIssueKinds,
): EvaluationIssue[] {
  const issues: EvaluationIssue[] = []

  for (const [key, value] of Object.entries(expected)) {
    if (received[key] !== value) {
      issues.push({ code: missing, field, key, expected: value, received: received[key] })
    }
  }

  for (const [key, value] of Object.entries(received)) {
    if (!(key in expected)) {
      issues.push({ code: unexpected, field, key, received: value })
    }
  }

  return issues
}

const checkMethod: RequestRule = (expected, request) =>
  request.method === expected.method
    ? []
    : [{ code: 'method', field: 'method', expected: expected.method, received: request.method }]

const checkPath: RequestRule = (expected, request) =>
  normalizePath(request.path) === normalizePath(expected.path)
    ? []
    : [{ code: 'path', field: 'path', expected: expected.path, received: request.path }]

const checkQuery: RequestRule = (expected, request) =>
  compareRecord(expected.query ?? {}, entriesToRecord(request.query), {
    field: 'query',
    missing: 'query-missing',
    unexpected: 'query-unexpected',
  })

// Header names are case-insensitive in HTTP, so both sides are lowercased before comparing.
const checkHeaders: RequestRule = (expected, request) =>
  compareRecord(
    Object.fromEntries(Object.entries(expected.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])),
    entriesToRecord(request.headers, true),
    { field: 'headers', missing: 'header-missing', unexpected: 'header-unexpected' },
  )

const checkBody: RequestRule = (expected, request) => {
  const expectsBody = expected.body !== undefined || expected.acceptedBodies !== undefined
  const sentBody = request.body.trim()

  if (!expectsBody) return sentBody ? [{ code: 'body-mismatch', field: 'body', received: request.body }] : []
  if (!sentBody) return [{ code: 'body-missing', field: 'body' }]

  try {
    const receivedBody = JSON.parse(request.body) as unknown
    const accepted = expected.acceptedBodies ?? [expected.body]
    return accepted.some((body) => sameJson(body, receivedBody)) ? [] : [{ code: 'body-mismatch', field: 'body' }]
  } catch {
    return [{ code: 'body-invalid-json', field: 'body' }]
  }
}

/** Rules applied to every request. Their order is the order the player reads the issues in. */
const requestRules: RequestRule[] = [checkMethod, checkPath, checkQuery, checkHeaders, checkBody]

/**
 * Evaluates a request against the objective of a mission.
 *
 * @param mission Mission being played.
 * @param request Request built by the player.
 * @returns The verdict and every problem found. It does not throw.
 */
export function evaluateRequest(mission: Mission, request: ApiRequest): EvaluationResult {
  const issues = requestRules.flatMap((rule) => rule(mission.expectation, request))
  return { correct: issues.length === 0, issues }
}
