import type { ApiRequest, ApiResponse } from './http'

export interface SandboxResource { id: number; [key: string]: unknown }
export interface SandboxState {
  version: 1
  users: SandboxResource[]
  products: SandboxResource[]
  orders: SandboxResource[]
}

export const SANDBOX_KEY = 'api-quest.sandbox'

export function createSandboxState(): SandboxState {
  return { version: 1, users: [{ id: 42, name: 'Ana Torres', email: 'ana@example.com' }], products: [{ id: 17, name: 'Mechanical Keyboard', price: 89.99, stock: 15 }], orders: [{ id: 903, customerId: 42, status: 'pending' }] }
}

function jsonBody(request: ApiRequest): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(request.body)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null
  } catch { return null }
}

export function loadSandbox(storage: Pick<Storage, 'getItem'>): SandboxState {
  try {
    const parsed = JSON.parse(storage.getItem(SANDBOX_KEY) ?? 'null') as Partial<SandboxState> | null
    return parsed?.version === 1 && Array.isArray(parsed.users) && Array.isArray(parsed.products) && Array.isArray(parsed.orders) ? parsed as SandboxState : createSandboxState()
  } catch { return createSandboxState() }
}

export function runSandboxRequest(state: SandboxState, request: ApiRequest): { state: SandboxState; response: ApiResponse } {
  const parts = request.path.trim().replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  if (parts.join('/') === 'auth/login' && request.method === 'POST') {
    const body = jsonBody(request)
    if (body?.email === 'developer@example.com' && body?.password === 'training-pass') {
      return { state, response: { status: 200, statusText: 'OK', body: { accessToken: 'aq_live_7f3a', tokenType: 'Bearer' } } }
    }
    return { state, response: { status: 401, statusText: 'Unauthorized', body: { error: 'Invalid credentials' } } }
  }
  const resource = parts[0] as 'users' | 'products' | 'orders'
  if (!['users', 'products', 'orders'].includes(resource)) return { state, response: { status: 404, statusText: 'Not Found', body: { error: 'Endpoint not found' } } }
  const collection = state[resource]
  const id = parts[1] ? Number(parts[1]) : null
  if (parts.length > 2 || (parts[1] && !Number.isInteger(id))) return { state, response: { status: 404, statusText: 'Not Found', body: { error: 'Endpoint not found' } } }

  if (request.method === 'GET') {
    if (id !== null) {
      const item = collection.find((entry) => entry.id === id)
      return { state, response: item ? { status: 200, statusText: 'OK', body: item } : { status: 404, statusText: 'Not Found', body: { error: 'Resource not found' } } }
    }
    const filters = Object.fromEntries(request.query.filter((entry) => entry.key).map((entry) => [entry.key, entry.value]))
    const items = collection.filter((item) => Object.entries(filters).every(([key, value]) => String(item[key]) === value))
    return { state, response: { status: 200, statusText: 'OK', body: items } }
  }

  if (request.method === 'POST' && id === null) {
    const body = jsonBody(request)
    if (!body) return { state, response: { status: 400, statusText: 'Bad Request', body: { error: 'A valid JSON object is required' } } }
    const created = { ...body, id: Math.max(0, ...collection.map((item) => item.id)) + 1 } as SandboxResource
    const next = { ...state, [resource]: [...collection, created] }
    return { state: next, response: { status: 201, statusText: 'Created', body: created } }
  }

  const index = id === null ? -1 : collection.findIndex((item) => item.id === id)
  if (index < 0) return { state, response: { status: 404, statusText: 'Not Found', body: { error: 'Resource not found' } } }
  if (request.method === 'DELETE') {
    return { state: { ...state, [resource]: collection.filter((item) => item.id !== id) }, response: { status: 204, statusText: 'No Content' } }
  }
  if (request.method === 'PATCH' || request.method === 'PUT') {
    const body = jsonBody(request)
    if (!body) return { state, response: { status: 400, statusText: 'Bad Request', body: { error: 'A valid JSON object is required' } } }
    const updated = request.method === 'PATCH' ? { ...collection[index], ...body, id } : { ...body, id }
    const nextCollection = collection.map((item, itemIndex) => itemIndex === index ? updated as SandboxResource : item)
    return { state: { ...state, [resource]: nextCollection }, response: { status: 200, statusText: 'OK', body: updated } }
  }
  return { state, response: { status: 405, statusText: 'Method Not Allowed', body: { error: 'Method not allowed for this endpoint' } } }
}
