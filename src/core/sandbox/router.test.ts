/** Tests of the simulated Sandbox API, including its hidden routes. */

import { describe, expect, it } from 'vitest'
import { createEmptyRequest, type ApiRequest, type HttpMethod } from '../http'
import { createMemoryStorage } from '../storage'
import { runSandboxRequest } from './router'
import { createSandboxState, loadSandbox, SANDBOX_KEY, saveSandbox, type SandboxState } from './state'

/** Builds a request from the parts each test cares about. */
function request(method: HttpMethod, path: string, extra: Partial<ApiRequest> = {}): ApiRequest {
  return { ...createEmptyRequest(), method, path, ...extra }
}

/** Builds the Authorization header of a token. */
const bearer = (token: string) => ({ headers: [{ id: 'h', key: 'authorization', value: `Bearer ${token}` }] })
const DEVELOPER = bearer('aq_live_7f3a')
const ADMIN = bearer('aq_admin_91bc')

const send = (method: HttpMethod, path: string, extra?: Partial<ApiRequest>, state: SandboxState = createSandboxState()) =>
  runSandboxRequest(state, request(method, path, extra))

describe('sandbox API', () => {
  it('keeps created resources for later requests', () => {
    const created = send('POST', '/products', { body: '{"name":"Mouse"}' })
    expect(created.response.status).toBe(201)
    const read = send('GET', '/products/18', undefined, created.state)
    expect(read.response.body).toMatchObject({ id: 18, name: 'Mouse' })
  })

  it('deletes an existing resource', () => {
    const result = send('DELETE', '/products/17')
    expect(result.response.status).toBe(204)
    expect(result.state.products).toHaveLength(0)
  })

  it('returns a token for the documented training credentials', () => {
    const result = send('POST', '/auth/login', { body: '{"email":"developer@example.com","password":"training-pass"}' })
    expect(result.response).toMatchObject({ status: 200, body: { accessToken: 'aq_live_7f3a' } })
  })

  it('keeps the remaining fields with PATCH and removes them with PUT', () => {
    const patched = send('PATCH', '/products/17', { body: '{"stock":1}' })
    expect(patched.response.body).toMatchObject({ id: 17, name: 'Mechanical Keyboard', stock: 1 })
    const replaced = send('PUT', '/products/17', { body: '{"stock":1}' })
    expect(replaced.response.body).toEqual({ id: 17, stock: 1 })
  })

  it('answers invalid routes and methods with API errors', () => {
    const status = (method: HttpMethod, path: string) => send(method, path).response.status
    expect(status('GET', '/unknown')).toBe(404)
    expect(status('GET', '/products/abc')).toBe(404)
    expect(status('GET', '/auth/login')).toBe(404)
    expect(status('DELETE', '/products')).toBe(404)
    expect(status('POST', '/products/17')).toBe(405)
    expect(status('POST', '/products/99')).toBe(404)
    expect(status('PATCH', '/products/17')).toBe(400)
  })

  it('declares the content type of responses with a body', () => {
    expect(send('GET', '/products').response.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(send('DELETE', '/products/17').response.headers).toBeUndefined()
  })
})

describe('protected endpoints', () => {
  it('asks for a token on the profile, as the missions teach', () => {
    const missing = send('GET', '/profile').response
    expect(missing).toMatchObject({ status: 401, body: { error: 'Authentication required' } })
    expect(missing.headers).toMatchObject({ 'WWW-Authenticate': 'Bearer' })
    expect(send('GET', '/profile', bearer('wrong')).response).toMatchObject({
      status: 401,
      body: { error: 'Invalid token' },
    })
    expect(send('GET', '/profile', DEVELOPER).response.body).toEqual({
      id: 7,
      name: 'Raúl Estévez',
      role: 'developer',
    })
  })

  it('updates the profile without letting the player change the role or the id', () => {
    const body = '{"name":"Ana","role":"admin","id":1}'
    const updated = send('PATCH', '/profile', { ...DEVELOPER, body })
    expect(updated.response.body).toEqual({ id: 7, name: 'Ana', role: 'developer' })
    expect(send('GET', '/profile', DEVELOPER, updated.state).response.body).toMatchObject({ name: 'Ana' })
  })

  it('tells 401 and 403 apart on admin endpoints', () => {
    expect(send('GET', '/admin/users').response.status).toBe(401)
    expect(send('GET', '/admin/users', DEVELOPER).response).toMatchObject({
      status: 403,
      body: { error: 'Admin role required' },
    })
    expect(send('GET', '/admin/users', ADMIN).response.status).toBe(200)
    expect(send('GET', '/admin/audit-log', ADMIN).response.status).toBe(200)
  })

  it('lets administrators update users and orders', () => {
    const result = send('PATCH', '/admin/orders/903', { ...ADMIN, body: '{"status":"refunded"}' })
    expect(result.response.body).toMatchObject({ id: 903, customerId: 42, status: 'refunded' })
    expect(result.state.orders[0].status).toBe('refunded')
    expect(send('DELETE', '/admin/orders/903', ADMIN).response.status).toBe(405)
    expect(send('GET', '/admin/unknown', ADMIN).response.status).toBe(404)
  })

  it('keeps the public collections open, as the first missions expect', () => {
    expect(send('GET', '/orders').response.status).toBe(200)
  })
})

describe('hidden routes', () => {
  it('leads from user 42 to the server room, in the language of the player', () => {
    const first = runSandboxRequest(createSandboxState(), request('GET', '/users/42'), 'es').response.body
    expect(first).toMatchObject({ name: 'Ana Torres', note: 'Alguien sigue trabajando en /users/0' })
    expect(send('GET', '/users/0').response.body).toMatchObject({ note: 'They left the lights on. See /server-room' })
    expect(send('GET', '/server-room').response.body).toMatchObject({ lights: 'on' })
  })

  it('does not reveal the night shift when listing users, and loses the clue with user 42', () => {
    expect(send('GET', '/users').response.body).toHaveLength(1)
    const deleted = send('DELETE', '/users/42').state
    expect(send('GET', '/users/42', undefined, deleted).response.status).toBe(404)
  })

  it('earns the achievement only when the lights go off', () => {
    const off = send('PATCH', '/server-room', { body: '{"lights":"off"}' })
    expect(off.earnedAchievement).toBe('night-shift')
    expect(off.state.lights).toBe('off')
    const red = send('PATCH', '/server-room', { body: '{"lights":"red"}' })
    expect(red.earnedAchievement).toBeUndefined()
    expect(red.state.lights).toBe('red')
    expect(send('PATCH', '/server-room', { body: '{"lights":"disco"}' }).response.status).toBe(400)
    expect(send('DELETE', '/server-room').response.status).toBe(405)
  })

  it('answers the teapot joke and pretends to delete production', () => {
    expect(send('GET', '/coffee').response).toMatchObject({ status: 418, statusText: "I'm a teapot" })
    const production = send('DELETE', '/production')
    expect(production.response.body).toMatchObject({ status: 'deleted' })
    expect(production.alarmFollowUp?.body).toMatchObject({ rollback: 'completed' })
    expect(production.state).toEqual(createSandboxState())
    expect(send('GET', '/production').response.status).toBe(404)
  })
})

describe('sandbox persistence', () => {
  it('round-trips and tells a first visit apart from damaged data', () => {
    const storage = createMemoryStorage()
    expect(loadSandbox(storage).status).toBe('new')
    saveSandbox(storage, createSandboxState())
    expect(loadSandbox(storage)).toEqual({ state: createSandboxState(), status: 'restored' })
    storage.setItem(SANDBOX_KEY, '{not json')
    expect(loadSandbox(storage)).toEqual({ state: createSandboxState(), status: 'reset' })
    storage.setItem(SANDBOX_KEY, '{"version":99}')
    expect(loadSandbox(storage).status).toBe('reset')
  })

  it('accepts data saved before the profile and the lights existed', () => {
    const storage = createMemoryStorage()
    storage.setItem(SANDBOX_KEY, '{"version":1,"users":[],"products":[],"orders":[]}')
    const { state, status } = loadSandbox(storage)
    expect(status).toBe('restored')
    expect(send('GET', '/profile', DEVELOPER, state).response.status).toBe(200)
    expect(send('GET', '/server-room', undefined, state).response.body).toMatchObject({ lights: 'on' })
  })
})
