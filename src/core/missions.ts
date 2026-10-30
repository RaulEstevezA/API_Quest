import type { ApiRequest, ApiResponse, HttpMethod } from './http'

export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type LocalizedText = {
  en: string
  es: string
}

export type RequestField = 'method' | 'path' | 'query' | 'headers' | 'body'

export interface MissionExpectation {
  method: HttpMethod
  path: string
  query?: Record<string, string>
  headers?: Record<string, string>
  body?: unknown
  acceptedBodies?: unknown[]
}

export interface Mission {
  id: string
  chapter: ChapterId
  order: number
  title: LocalizedText
  brief: LocalizedText
  objective: LocalizedText
  service: 'Users API' | 'Products API' | 'Orders API' | 'Authentication API' | 'Admin API'
  availableFields: RequestField[]
  starter?: Partial<ApiRequest>
  expectation: MissionExpectation
  successResponse: ApiResponse
  hints: LocalizedText[]
  explanation: LocalizedText
  concepts: string[]
  xp: number
}

export interface Chapter {
  id: ChapterId
  title: LocalizedText
  description: LocalizedText
  concepts: string[]
}
