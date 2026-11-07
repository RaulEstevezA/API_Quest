/**
 * Public collections of the API, with one strategy per HTTP method. To serve another
 * collection, add its name to `RESOURCE_NAMES` and its seed data to `state.ts`.
 */

import type { ApiRequest, ApiResponse, HttpMethod } from '../../http'
import {
  invalidBody,
  jsonBody,
  methodNotAllowed,
  resourceNotFound,
  type Route,
  type SandboxResource,
  type SandboxResult,
  type SandboxState,
} from '../state'

/** Collections served by the API. */
const RESOURCE_NAMES = ['users', 'products', 'orders'] as const

/** Name of a collection. */
export type ResourceName = (typeof RESOURCE_NAMES)[number]

/** A request already routed to a collection. `id` is `null` when it targets the whole collection. */
export interface ResourceRequest {
  state: SandboxState
  request: ApiRequest
  resource: ResourceName
  id: number | null
}

/** Answers a request for a collection or one of its records. */
export type MethodHandler = (context: ResourceRequest) => SandboxResult

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
    const response: ApiResponse = collection.some((item) => item.id === id) ? methodNotAllowed() : resourceNotFound()
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
export function createUpdateHandler(merge: boolean): MethodHandler {
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

/** Serves `/<collection>` and `/<collection>/<id>`. Any other path belongs to another route. */
export const resourcesRoute: Route = ({ state, request, parts }) => {
  const [resource, rawId] = parts
  if (!resource || !isResourceName(resource) || parts.length > 2) return null
  const id = rawId ? Number(rawId) : null
  if (id !== null && !Number.isInteger(id)) return null
  return methodHandlers[request.method]({ state, request, resource, id })
}
