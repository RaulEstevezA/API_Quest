/**
 * HTTP vocabulary shared by missions, the validator, the Sandbox and the interface.
 * It contains only contracts and one factory, with no game rules.
 */

/** Methods the player can choose in the request builder. */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

/** One of the supported HTTP methods. */
export type HttpMethod = (typeof HTTP_METHODS)[number]

/** A header row of the form. `id` only identifies the row while it is being edited. */
export interface HeaderEntry {
  id: string
  key: string
  value: string
}

/** A query parameter row of the form. `id` only identifies the row while it is being edited. */
export interface QueryEntry {
  id: string
  key: string
  value: string
}

/** A request as the player builds it. `body` is raw text because it may not be valid JSON yet. */
export interface ApiRequest {
  method: HttpMethod
  path: string
  query: QueryEntry[]
  headers: HeaderEntry[]
  body: string
}

/** A simulated API response. */
export interface ApiResponse {
  status: number
  statusText: string
  headers?: Record<string, string>
  body?: unknown
}

/** Creates the request a mission starts from when it does not define its own. */
export function createEmptyRequest(): ApiRequest {
  return {
    method: 'GET',
    path: '',
    query: [],
    headers: [],
    body: '',
  }
}
