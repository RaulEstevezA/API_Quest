/** Tests of the simulated Sandbox API. */

import { describe, expect, it } from 'vitest'
import { createEmptyRequest, type HttpMethod } from './http'
import { createSandboxState, runSandboxRequest } from './sandbox'

describe('sandbox API', () => {
  it('keeps created resources for later requests', () => {
    const created = runSandboxRequest(createSandboxState(), {
      ...createEmptyRequest(),
      method: 'POST',
      path: '/products',
      body: '{"name":"Mouse"}',
    })
    expect(created.response.status).toBe(201)
    const read = runSandboxRequest(created.state, { ...createEmptyRequest(), path: '/products/18' })
    expect(read.response.body).toMatchObject({ id: 18, name: 'Mouse' })
  })

  it('deletes an existing resource', () => {
    const result = runSandboxRequest(createSandboxState(), {
      ...createEmptyRequest(),
      method: 'DELETE',
      path: '/products/17',
    })
    expect(result.response.status).toBe(204)
    expect(result.state.products).toHaveLength(0)
  })

  it('keeps the remaining fields with PATCH and removes them with PUT', () => {
    const patched = runSandboxRequest(createSandboxState(), {
      ...createEmptyRequest(),
      method: 'PATCH',
      path: '/products/17',
      body: '{"stock":1}',
    })
    expect(patched.response.body).toMatchObject({ id: 17, name: 'Mechanical Keyboard', stock: 1 })
    const replaced = runSandboxRequest(createSandboxState(), {
      ...createEmptyRequest(),
      method: 'PUT',
      path: '/products/17',
      body: '{"stock":1}',
    })
    expect(replaced.response.body).toEqual({ id: 17, stock: 1 })
  })

  it('answers invalid routes and methods with API errors', () => {
    const send = (method: HttpMethod, path: string) =>
      runSandboxRequest(createSandboxState(), { ...createEmptyRequest(), method, path }).response.status
    expect(send('GET', '/unknown')).toBe(404)
    expect(send('GET', '/products/abc')).toBe(404)
    expect(send('GET', '/auth/login')).toBe(404)
    expect(send('DELETE', '/products')).toBe(404)
    expect(send('POST', '/products/17')).toBe(405)
    expect(send('POST', '/products/99')).toBe(404)
    expect(send('PATCH', '/products/17')).toBe(400)
  })

  it('returns a token for the documented training credentials', () => {
    const result = runSandboxRequest(createSandboxState(), {
      ...createEmptyRequest(),
      method: 'POST',
      path: '/auth/login',
      body: '{"email":"developer@example.com","password":"training-pass"}',
    })
    expect(result.response).toMatchObject({ status: 200, body: { accessToken: 'aq_live_7f3a' } })
  })
})
