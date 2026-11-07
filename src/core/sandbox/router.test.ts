/** Tests of the simulated Sandbox API. */

import { describe, expect, it } from 'vitest'
import { createEmptyRequest, type ApiRequest, type HttpMethod } from '../http'
import { createMemoryStorage } from '../storage'
import { runSandboxRequest } from './router'
import { createSandboxState, loadSandbox, SANDBOX_KEY, saveSandbox, type SandboxState } from './state'

/** Builds a request from the parts each test cares about. */
function request(method: HttpMethod, path: string, extra: Partial<ApiRequest> = {}): ApiRequest {
  return { ...createEmptyRequest(), method, path, ...extra }
}

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

})
