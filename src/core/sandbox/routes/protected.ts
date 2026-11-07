/**
 * Endpoints that require a token, following the rules the missions teach: `/profile`
 * accepts any valid token, and `/admin` also requires the admin role. A missing or
 * invalid token gives 401, and a valid token without the role gives 403.
 */

import type { ApiResponse } from '../../http'
import {
  createSandboxProfile,
  endpointNotFound,
  invalidBody,
  jsonBody,
  methodNotAllowed,
  type Route,
  type SandboxProfile,
} from '../state'
import { authenticate } from './auth'
import { createUpdateHandler, type ResourceName } from './resources'

/** Fixed entries of the audit log. They are fictional. */
const AUDIT_LOG = [
  { id: 1, action: 'order.status_changed', orderId: 903, actor: 'admin@example.com' },
  { id: 2, action: 'user.updated', userId: 42, actor: 'admin@example.com' },
]

const forbidden = (): ApiResponse => ({
  status: 403,
  statusText: 'Forbidden',
  body: { error: 'Admin role required' },
})

/** Serves the private profile of the training account. */
export const profileRoute: Route = ({ state, request, parts }) => {
  if (parts.join('/') !== 'profile') return null
  const auth = authenticate(request)
  if ('failure' in auth) return { state, response: auth.failure }

  const profile = state.profile ?? createSandboxProfile()
  if (request.method === 'GET') {
    return { state, response: { status: 200, statusText: 'OK', body: { ...profile, role: auth.role } } }
  }
  if (request.method !== 'PATCH') return { state, response: methodNotAllowed() }

  const body = jsonBody(request)
  if (!body) return { state, response: invalidBody() }
  // The token decides the role and the account decides the id, so the player cannot change them.
  const updated: SandboxProfile = { ...profile, ...body, id: profile.id }
  delete updated.role
  return {
    state: { ...state, profile: updated },
    response: { status: 200, statusText: 'OK', body: { ...updated, role: auth.role } },
  }
}

/** Serves the administration endpoints. Permissions are checked before anything else. */
export const adminRoute: Route = ({ state, request, parts }) => {
  if (parts[0] !== 'admin') return null
  const auth = authenticate(request)
  if ('failure' in auth) return { state, response: auth.failure }
  if (auth.role !== 'admin') return { state, response: forbidden() }

  const path = parts.slice(1).join('/')
  const isRead = request.method === 'GET'
  if (path === 'users' || path === 'audit-log') {
    if (!isRead) return { state, response: methodNotAllowed() }
    return { state, response: { status: 200, statusText: 'OK', body: path === 'users' ? state.users : AUDIT_LOG } }
  }

  // Administrators update users and orders by id, keeping the fields they do not send.
  const [collection, rawId] = parts.slice(1)
  const id = Number(rawId)
  if ((collection !== 'users' && collection !== 'orders') || parts.length !== 3 || !Number.isInteger(id)) {
    return { state, response: endpointNotFound() }
  }
  if (request.method !== 'PATCH') return { state, response: methodNotAllowed() }
  return createUpdateHandler(true)({ state, request, resource: collection as ResourceName, id })
}
