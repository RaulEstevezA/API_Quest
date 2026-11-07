/**
 * Authentication of the simulated API: the login exercise and the reading of the
 * token sent by the player. The credentials and the tokens are fictional, and match
 * the ones the missions teach.
 */

import type { ApiRequest, ApiResponse } from '../../http'
import { jsonBody, type Route } from '../state'

/** Credentials documented for the login exercise. */
const TRAINING_CREDENTIALS = { email: 'developer@example.com', password: 'training-pass' }

/** Roles the API can grant. */
export type Role = 'developer' | 'admin'

/** Token returned by login, and the role of each valid token. */
const DEVELOPER_TOKEN = 'aq_live_7f3a'
const TOKEN_ROLES: Record<string, Role> = { [DEVELOPER_TOKEN]: 'developer', aq_admin_91bc: 'admin' }

/** Answers the login exercise with a fictional token. */
export const loginRoute: Route = ({ state, request, parts }) => {
  if (parts.join('/') !== 'auth/login' || request.method !== 'POST') return null
  const body = jsonBody(request)
  if (body?.email === TRAINING_CREDENTIALS.email && body?.password === TRAINING_CREDENTIALS.password) {
    return {
      state,
      response: { status: 200, statusText: 'OK', body: { accessToken: DEVELOPER_TOKEN, tokenType: 'Bearer' } },
    }
  }
  return { state, response: { status: 401, statusText: 'Unauthorized', body: { error: 'Invalid credentials' } } }
}

/**
 * Checks the Authorization header of a request.
 *
 * @param request Request built by the player. Header names are case-insensitive, as in HTTP.
 * @returns The role of the token, or the 401 response that explains what is wrong with it.
 */
export function authenticate(request: ApiRequest): { role: Role } | { failure: ApiResponse } {
  const header = request.headers.find((entry) => entry.key.trim().toLowerCase() === 'authorization')
  const unauthorized = (error: string): { failure: ApiResponse } => ({
    failure: {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'WWW-Authenticate': 'Bearer', 'Content-Type': 'application/json' },
      body: { error },
    },
  })
  if (!header) return unauthorized('Authentication required')
  const role = TOKEN_ROLES[header.value.trim().replace(/^Bearer\s+/i, '')]
  return role ? { role } : unauthorized('Invalid token')
}
