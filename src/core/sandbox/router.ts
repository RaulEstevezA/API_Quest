/**
 * Simulated REST API of the free-practice Sandbox (Registry of routes).
 *
 * `routes` is tried in order, and the first route that recognises a request answers it.
 * To add an endpoint, write a `Route` in `routes/` and add it here. State is immutable:
 * each request returns the next state.
 */

import type { ApiRequest, ApiResponse } from '../http'
import type { LocalizedText } from '../missions'
import { loginRoute } from './routes/auth'
import { resourcesRoute } from './routes/resources'
import { endpointNotFound, type Route, type SandboxResult, type SandboxState } from './state'

const routes: Route[] = [loginRoute, resourcesRoute]

/** A body is always JSON here, so responses declare it unless a route has set its own headers. */
function withContentType(response: ApiResponse): ApiResponse {
  if (response.body === undefined || response.headers) return response
  return { ...response, headers: { 'Content-Type': 'application/json' } }
}

/**
 * Runs a request against the simulated API.
 *
 * @param state Current state. It is not mutated.
 * @param request Request built by the player.
 * @param language Language of the texts that are game content rather than API data.
 * @returns The next state and the response. API errors are responses; it does not throw.
 */
export function runSandboxRequest(
  state: SandboxState,
  request: ApiRequest,
  language: keyof LocalizedText = 'en',
): SandboxResult {
  const parts = request.path
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
  const context = { state, request, parts, language }

  for (const route of routes) {
    const result = route(context)
    if (result) {
      return {
        ...result,
        response: withContentType(result.response),
        alarmFollowUp: result.alarmFollowUp && withContentType(result.alarmFollowUp),
      }
    }
  }
  return { state, response: withContentType(endpointNotFound()) }
}
