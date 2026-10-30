import type { ApiResponse } from '../core/http'
import type { LocalizedText, Mission } from '../core/missions'

export const t = (en: string, es: string): LocalizedText => ({ en, es })

type MissionInput = Omit<Mission, 'order' | 'xp' | 'hints'> & {
  hints?: LocalizedText[]
  xp?: number
}

export function mission(order: number, input: MissionInput): Mission {
  return { ...input, order, xp: input.xp ?? 100, hints: input.hints ?? [] }
}

export function response(status: number, statusText: string, body?: unknown): ApiResponse {
  return {
    status,
    statusText,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body,
  }
}

export const contentType = { 'Content-Type': 'application/json' }
export const bearer = { Authorization: 'Bearer aq_live_7f3a' }
