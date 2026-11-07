/**
 * Shorthands used to write the mission catalogue, so that each mission declares
 * only what makes it different.
 */

import type { ApiResponse } from '../core/http'
import type { LocalizedText, Mission } from '../core/missions'

/**
 * Builds a bilingual text.
 *
 * @param en English text.
 * @param es Spanish text.
 * @returns The text in both languages.
 */
export const t = (en: string, es: string): LocalizedText => ({ en, es })

type MissionInput = Omit<Mission, 'order' | 'xp' | 'hints'> & {
  hints?: LocalizedText[]
  xp?: number
}

/**
 * Completes a mission definition with the common defaults: 100 XP and no hints.
 *
 * @param order Position within the chapter, starting at 1.
 * @param input Fields of the mission.
 * @returns The complete mission.
 */
export function mission(order: number, input: MissionInput): Mission {
  return { ...input, order, xp: input.xp ?? 100, hints: input.hints ?? [] }
}

/**
 * Builds a simulated response, adding the JSON content type when it has a body.
 *
 * @param status HTTP status code.
 * @param statusText HTTP reason phrase.
 * @param body Optional JSON body.
 * @returns The response.
 */
export function response(status: number, statusText: string, body?: unknown): ApiResponse {
  return {
    status,
    statusText,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body,
  }
}

/** Header expected by the missions that send JSON. */
export const contentType = { 'Content-Type': 'application/json' }
/** Header expected by the missions on protected endpoints. The token is fictional. */
export const bearer = { Authorization: 'Bearer aq_live_7f3a' }
