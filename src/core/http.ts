export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

export type HttpMethod = (typeof HTTP_METHODS)[number]

export interface HeaderEntry {
  id: string
  key: string
  value: string
}

export interface QueryEntry {
  id: string
  key: string
  value: string
}

export interface ApiRequest {
  method: HttpMethod
  path: string
  query: QueryEntry[]
  headers: HeaderEntry[]
  body: string
}

export interface ApiResponse {
  status: number
  statusText: string
  headers?: Record<string, string>
  body?: unknown
}

export function createEmptyRequest(): ApiRequest {
  return {
    method: 'GET',
    path: '',
    query: [],
    headers: [],
    body: '',
  }
}
