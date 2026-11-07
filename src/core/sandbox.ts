/**
 * Simulated REST API of the free-practice Sandbox (Strategy per HTTP method).
 *
 * `runSandboxRequest` routes a request and delegates to the handler registered for
 * its method in `methodHandlers`. State is immutable: each request returns the next
 * state. To support another resource, add its name to `RESOURCE_NAMES` and its
 * seed data to `createSandboxState`.
 */

import type { ApiRequest, ApiResponse, HttpMethod } from './http'
import { safeRead, safeWrite, type StorageAdapter } from './storage'

/** Key of the saved Sandbox data. */
export const SANDBOX_KEY = 'api-quest.sandbox'

/** Version of the saved format. Other versions start again from the seed data. */
const SANDBOX_VERSION = 1

/** Collections served by the API. */
const RESOURCE_NAMES = ['users', 'products', 'orders'] as const

type ResourceName = (typeof RESOURCE_NAMES)[number]

/** Credentials documented for the login exercise. They are fictional. */
const TRAINING_CREDENTIALS = { email: 'developer@example.com', password: 'training-pass' }

/** A record of a collection. Apart from `id`, its fields are free. */
export interface SandboxResource {
  id: number
  [key: string]: unknown
}

/** Full contents of the simulated API. */
export interface SandboxState {
  version: typeof SANDBOX_VERSION
  users: SandboxResource[]
  products: SandboxResource[]
  orders: SandboxResource[]
}

/** State after a request and the response to show. */
export interface SandboxResult {
  state: SandboxState
  response: ApiResponse
}

/** A request already routed to a collection. `id` is `null` when it targets the whole collection. */
interface ResourceRequest {
  state: SandboxState
  request: ApiRequest
  resource: ResourceName
  id: number | null
}

type MethodHandler = (context: ResourceRequest) => SandboxResult

/** Creates the seed data of the API. */
export function createSandboxState(): SandboxState {
  return {
    version: SANDBOX_VERSION,
    users: [{ id: 42, name: 'Ana Torres', email: 'ana@example.com' }],
    products: [{ id: 17, name: 'Mechanical Keyboard', price: 89.99, stock: 15 }],
    orders: [{ id: 903, customerId: 42, status: 'pending' }],
  }
}

/**
 * Reads the saved Sandbox data. This is practice data rather than game progress,
 * so unreadable data simply starts again from the seed data.
 *
 * @param storage Store that holds the data.
 * @returns The saved state, or the seed data. It does not throw.
 */
export function loadSandbox(storage: Pick<StorageAdapter, 'getItem'>): SandboxState {
  try {
    const parsed = JSON.parse(safeRead(storage, SANDBOX_KEY) ?? 'null') as Partial<SandboxState> | null
    const valid =
      parsed?.version === SANDBOX_VERSION &&
      Array.isArray(parsed.users) &&
      Array.isArray(parsed.products) &&
      Array.isArray(parsed.orders)
    return valid ? (parsed as SandboxState) : createSandboxState()
  } catch {
    return createSandboxState()
  }
}

/**
 * Saves the Sandbox data. A failure is ignored because the in-memory state stays usable.
 *
 * @param storage Store that receives the data.
 * @param state State to save.
 */
export function saveSandbox(storage: Pick<StorageAdapter, 'setItem'>, state: SandboxState): void {
  safeWrite(storage, SANDBOX_KEY, JSON.stringify(state))
}

const endpointNotFound = (): ApiResponse => ({
  status: 404,
  statusText: 'Not Found',
  body: { error: 'Endpoint not found' },
})

const resourceNotFound = (): ApiResponse => ({
  status: 404,
  statusText: 'Not Found',
  body: { error: 'Resource not found' },
})

const invalidBody = (): ApiResponse => ({
  status: 400,
  statusText: 'Bad Request',
  body: { error: 'A valid JSON object is required' },
})

/** Parses the request body, accepting only JSON objects. */
function jsonBody(request: ApiRequest): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(request.body)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function isResourceName(value: string): value is ResourceName {
  return (RESOURCE_NAMES as readonly string[]).includes(value)
}

/** Reads one record, or filters the collection by query parameters using exact matches. */
const handleGet: MethodHandler = ({ state, request, resource, id }) => {
  const collection = state[resource]
  if (id !== null) {
    const item = collection.find((entry) => entry.id === id)
    return { state, response: item ? { status: 200, statusText: 'OK', body: item } : resourceNotFound() }
  }
  const filters = request.query.filter((entry) => entry.key)
  const items = collection.filter((item) => filters.every((entry) => String(item[entry.key]) === entry.value))
  return { state, response: { status: 200, statusText: 'OK', body: items } }
}

/** Creates a record with the next free id. POST to an existing record is not allowed. */
const handlePost: MethodHandler = ({ state, request, resource, id }) => {
  const collection = state[resource]
  if (id !== null) {
    const response: ApiResponse = collection.some((item) => item.id === id)
      ? { status: 405, statusText: 'Method Not Allowed', body: { error: 'Method not allowed for this endpoint' } }
      : resourceNotFound()
    return { state, response }
  }
  const body = jsonBody(request)
  if (!body) return { state, response: invalidBody() }
  const created = { ...body, id: Math.max(0, ...collection.map((item) => item.id)) + 1 } as SandboxResource
  return {
    state: { ...state, [resource]: [...collection, created] },
    response: { status: 201, statusText: 'Created', body: created },
  }
}

/**
 * Builds the handler of an update.
 *
 * @param merge `true` for PATCH, which keeps the fields not sent; `false` for PUT, which replaces them.
 * @returns The handler for that method.
 */
function createUpdateHandler(merge: boolean): MethodHandler {
  return ({ state, request, resource, id }) => {
    const collection = state[resource]
    const current = collection.find((item) => item.id === id)
    if (!current || id === null) return { state, response: resourceNotFound() }
    const body = jsonBody(request)
    if (!body) return { state, response: invalidBody() }
    const updated = (merge ? { ...current, ...body, id } : { ...body, id }) as SandboxResource
    return {
      state: { ...state, [resource]: collection.map((item) => (item.id === id ? updated : item)) },
      response: { status: 200, statusText: 'OK', body: updated },
    }
  }
}

/** Removes a record. */
const handleDelete: MethodHandler = ({ state, resource, id }) => {
  const collection = state[resource]
  if (!collection.some((item) => item.id === id)) return { state, response: resourceNotFound() }
  return {
    state: { ...state, [resource]: collection.filter((item) => item.id !== id) },
    response: { status: 204, statusText: 'No Content' },
  }
}

/** One handler per method. `Record` makes the compiler require a handler for any new method. */
const methodHandlers: Record<HttpMethod, MethodHandler> = {
  GET: handleGet,
  POST: handlePost,
  PUT: createUpdateHandler(false),
  PATCH: createUpdateHandler(true),
  DELETE: handleDelete,
}

/** Answers the login exercise with a fictional token. */
function handleLogin(state: SandboxState, request: ApiRequest): SandboxResult {
  const body = jsonBody(request)
  if (body?.email === TRAINING_CREDENTIALS.email && body?.password === TRAINING_CREDENTIALS.password) {
    return {
      state,
      response: { status: 200, statusText: 'OK', body: { accessToken: 'aq_live_7f3a', tokenType: 'Bearer' } },
    }
  }
  return { state, response: { status: 401, statusText: 'Unauthorized', body: { error: 'Invalid credentials' } } }
}

/**
 * Runs a request against the simulated API.
 *
 * @param state Current state. It is not mutated.
 * @param request Request built by the player.
 * @returns The next state and the response. API errors are responses; it does not throw.
 */
export function runSandboxRequest(state: SandboxState, request: ApiRequest): SandboxResult {
  const parts = request.path
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)

  if (parts.join('/') === 'auth/login' && request.method === 'POST') return handleLogin(state, request)

  const [resource, rawId] = parts
  const id = rawId ? Number(rawId) : null
  const validRoute = parts.length <= 2 && (id === null || Number.isInteger(id))
  if (!resource || !isResourceName(resource) || !validRoute) return { state, response: endpointNotFound() }

  return methodHandlers[request.method]({ state, request, resource, id })
}
