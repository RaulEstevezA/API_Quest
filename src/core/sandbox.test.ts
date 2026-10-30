import { describe, expect, it } from 'vitest'
import { createEmptyRequest } from './http'
import { createSandboxState, runSandboxRequest } from './sandbox'

describe('sandbox API', () => {
  it('keeps created resources for later requests', () => {
    const created = runSandboxRequest(createSandboxState(), { ...createEmptyRequest(), method: 'POST', path: '/products', body: '{"name":"Mouse"}' })
    expect(created.response.status).toBe(201)
    const read = runSandboxRequest(created.state, { ...createEmptyRequest(), path: '/products/18' })
    expect(read.response.body).toMatchObject({ id: 18, name: 'Mouse' })
  })

  it('deletes an existing resource', () => {
    const result = runSandboxRequest(createSandboxState(), { ...createEmptyRequest(), method: 'DELETE', path: '/products/17' })
    expect(result.response.status).toBe(204)
    expect(result.state.products).toHaveLength(0)
  })
})
