/**
 * State of the simulated API: its data, its persistence and the contracts shared by
 * the routes in `routes/`. It contains no routing. Fields added after version 1 are
 * optional, so that data saved by earlier sessions stays valid.
 */

import type { ApiRequest, ApiResponse } from '../http'
import type { LocalizedText } from '../missions'
import { safeRead, safeWrite, type LoadStatus, type StorageAdapter } from '../storage'

/** Key of the saved Sandbox data. */
export const SANDBOX_KEY = 'api-quest.sandbox'

/** Version of the saved format. Other versions start again from the seed data. */
const SANDBOX_VERSION = 1

/** A record of a collection. Apart from `id`, its fields are free. */
export interface SandboxResource {
  id: number
  [key: string]: unknown
}

/** States of the lights of the server room, which the background of the game shows. */
export type RoomLights = 'on' | 'off' | 'red'

/** Private profile of the training account. */
export type SandboxProfile = Record<string, unknown>

/** Full contents of the simulated API. */
export interface SandboxState {
  version: typeof SANDBOX_VERSION
  users: SandboxResource[]
  products: SandboxResource[]
  orders: SandboxResource[]
  profile?: SandboxProfile
  lights?: RoomLights
}

/** State after a request, the response to show and any effect outside the API. */
export interface SandboxResult {
  state: SandboxState
  response: ApiResponse
  /** Achievement earned by this request. */
  earnedAchievement?: string
  /** Shows the recovered image below the response. */
  renderPortrait?: boolean
  /** Starts the alarm of the room. This response replaces the current one when it ends. */
  alarmFollowUp?: ApiResponse
}

/** What a route receives. `parts` are the segments of the path. */
export interface RouteContext {
  state: SandboxState
  request: ApiRequest
  parts: string[]
  language: keyof LocalizedText
}

/** Answers a request, or returns `null` when it belongs to another route. */
export type Route = (context: RouteContext) => SandboxResult | null

/** Saved data and how it was obtained. */
export interface SandboxLoadResult {
  state: SandboxState
  status: LoadStatus
}

/** Creates the seed data of the API. */
export function createSandboxState(): SandboxState {
  return {
    version: SANDBOX_VERSION,
    users: [
      { id: 42, name: 'Ana Torres', email: 'ana@example.com' },
      { id: 55, name: 'Luis Romero', email: 'luis@example.com' },
      { id: 61, name: 'Marta Gil', email: 'marta@example.com' },
    ],
    products: [
      { id: 17, name: 'Mechanical Keyboard', category: 'peripherals', price: 89.99, stock: 15 },
      { id: 21, name: 'Webcam', category: 'peripherals', price: 59.9, stock: 8 },
      { id: 24, name: 'USB-C Hub', category: 'accessories', price: 39.5, stock: 30 },
      { id: 30, name: 'Travel Laptop', category: 'laptops', price: 899, stock: 4 },
      { id: 33, name: 'Pro Laptop', category: 'laptops', price: 1450, stock: 2 },
      { id: 40, name: 'Laptop Stand', category: 'accessories', price: 29, stock: 22 },
    ],
    orders: [
      { id: 903, customerId: 42, status: 'pending', createdAt: '2026-11-02' },
      { id: 904, customerId: 42, status: 'paid', createdAt: '2026-11-03' },
      { id: 905, customerId: 55, status: 'paid', createdAt: '2026-11-05' },
      { id: 906, customerId: 61, status: 'shipped', createdAt: '2026-11-06' },
    ],
    profile: createSandboxProfile(),
    lights: 'on',
  }
}

/** Creates the profile of the training account, the same one the missions show. */
export function createSandboxProfile(): SandboxProfile {
  return { id: 7, name: 'Raúl Estévez' }
}

/**
 * Reads the saved Sandbox data.
 *
 * @param storage Store that holds the data.
 * @returns The saved state or the seed data, with a status that tells a first visit
 * apart from saved data that could not be restored. It does not throw.
 */
export function loadSandbox(storage: Pick<StorageAdapter, 'getItem'>): SandboxLoadResult {
  const saved = safeRead(storage, SANDBOX_KEY)
  if (!saved) return { state: createSandboxState(), status: 'new' }
  try {
    const parsed = JSON.parse(saved) as Partial<SandboxState> | null
    const valid =
      parsed?.version === SANDBOX_VERSION &&
      Array.isArray(parsed.users) &&
      Array.isArray(parsed.products) &&
      Array.isArray(parsed.orders)
    if (valid) return { state: parsed as SandboxState, status: 'restored' }
  } catch {
    // Corrupted JSON is handled below, exactly like an incompatible version.
  }
  return { state: createSandboxState(), status: 'reset' }
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

/**
 * Parses the body of a request, accepting only JSON objects.
 *
 * @param request Request built by the player.
 * @returns The object, or `null` when the body is anything else.
 */
export function jsonBody(request: ApiRequest): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(request.body)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** 404 for a path the API does not have. */
export const endpointNotFound = (): ApiResponse => ({
  status: 404,
  statusText: 'Not Found',
  body: { error: 'Endpoint not found' },
})

/** 404 for a record that does not exist. */
export const resourceNotFound = (): ApiResponse => ({
  status: 404,
  statusText: 'Not Found',
  body: { error: 'Resource not found' },
})

/** 400 for a body that is not a JSON object. */
export const invalidBody = (): ApiResponse => ({
  status: 400,
  statusText: 'Bad Request',
  body: { error: 'A valid JSON object is required' },
})

/** 405 for a path that exists but does not accept the method. */
export const methodNotAllowed = (): ApiResponse => ({
  status: 405,
  statusText: 'Method Not Allowed',
  body: { error: 'Method not allowed for this endpoint' },
})
