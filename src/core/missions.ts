/**
 * Contracts of the declarative content. Chapters and missions are plain data that
 * follows these types, so adding a mission never requires changing the game engine.
 */

import type { ApiRequest, ApiResponse, HttpMethod } from './http'

/** Chapters of the game. */
export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** A text in every language of the game. All visible text uses this shape. */
export type LocalizedText = {
  en: string
  es: string
}

/** Parts of a request the player can edit. */
export type RequestField = 'method' | 'path' | 'query' | 'headers' | 'body'

/** What a request must contain to solve a mission. */
export interface MissionExpectation {
  method: HttpMethod
  path: string
  query?: Record<string, string>
  headers?: Record<string, string>
  body?: unknown
  /** Alternative valid bodies. When present, it replaces `body`. */
  acceptedBodies?: unknown[]
}

/** A complete exercise: its story, its objective, its solution and its explanation. */
export interface Mission {
  id: string
  chapter: ChapterId
  /** Position within the chapter, starting at 1. */
  order: number
  title: LocalizedText
  brief: LocalizedText
  objective: LocalizedText
  service: 'Users API' | 'Products API' | 'Orders API' | 'Authentication API' | 'Admin API'
  /** Parts of the request the builder shows or enables for this mission. */
  availableFields: RequestField[]
  /** Prefilled request, used by the missions that ask the player to repair one. */
  starter?: Partial<ApiRequest>
  expectation: MissionExpectation
  /** Response shown when solved. It can be an error when the mission is about reading that error. */
  successResponse: ApiResponse
  hints: LocalizedText[]
  explanation: LocalizedText
  concepts: string[]
  /** XP for a first-attempt solution without hints. See `scoring.ts`. */
  xp: number
}

/** A group of missions about one topic. */
export interface Chapter {
  id: ChapterId
  title: LocalizedText
  description: LocalizedText
  concepts: string[]
}
