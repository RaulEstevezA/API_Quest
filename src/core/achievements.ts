/**
 * Registry of achievements (Registry pattern).
 *
 * Each achievement declares its own unlock rule. To add one, append an entry to
 * `achievements`; no other code has to change.
 */

import type { LocalizedText } from './missions'

/** Missions per chapter. Must match the catalogue, which a content test verifies. */
const MISSIONS_PER_CHAPTER = 8

/** Secret achievement earned in the Sandbox. Finding it is part of the secret. */
export const NIGHT_SHIFT_ACHIEVEMENT = 'night-shift'

/** Missions in the whole game. Must match the catalogue, which a content test verifies. */
const TOTAL_MISSIONS = 56

/** A milestone tied to the player's learning progress. */
export interface Achievement {
  id: string
  title: LocalizedText
  description: LocalizedText
  /** Decides whether the achievement is earned from the identifiers of the completed missions. */
  isUnlocked: (completedIds: ReadonlySet<string>) => boolean
  /** `true` when it is earned by an action rather than by missions, and stays hidden until then. */
  secret?: boolean
}

/**
 * Builds the rule "every mission of a chapter is complete".
 *
 * @param prefix Prefix shared by the mission identifiers of the chapter.
 * @returns The unlock rule for that chapter.
 */
function chapterCompleted(prefix: string): Achievement['isUnlocked'] {
  return (completedIds) => [...completedIds].filter((id) => id.startsWith(`${prefix}-`)).length === MISSIONS_PER_CHAPTER
}

/** Every achievement in the game, in display order. */
export const achievements: Achievement[] = [
  {
    id: 'http-rookie',
    title: { en: 'HTTP Rookie', es: 'HTTP Rookie' },
    description: { en: 'Complete your first request.', es: 'Completa tu primera petición.' },
    isUnlocked: (completedIds) => completedIds.size >= 1,
  },
  {
    id: 'request-builder',
    title: { en: 'Request Builder', es: 'Request Builder' },
    description: { en: 'Complete the First Request chapter.', es: 'Completa el capítulo Primera petición.' },
    isUnlocked: chapterCompleted('first-request'),
  },
  {
    id: 'method-specialist',
    title: { en: 'Method Specialist', es: 'Method Specialist' },
    description: { en: 'Complete the HTTP Methods chapter.', es: 'Completa el capítulo Métodos HTTP.' },
    isUnlocked: chapterCompleted('http-methods'),
  },
  {
    id: 'status-code-hunter',
    title: { en: 'Status Code Hunter', es: 'Status Code Hunter' },
    description: { en: 'Complete the Status Codes chapter.', es: 'Completa el capítulo Códigos de estado.' },
    isUnlocked: chapterCompleted('status-codes'),
  },
  {
    id: 'json-builder',
    title: { en: 'JSON Builder', es: 'JSON Builder' },
    description: { en: 'Complete the JSON Lab.', es: 'Completa el Laboratorio JSON.' },
    isUnlocked: chapterCompleted('json-lab'),
  },
  {
    id: 'query-navigator',
    title: { en: 'Query Navigator', es: 'Query Navigator' },
    description: { en: 'Complete Query Parameters.', es: 'Completa Parámetros query.' },
    isUnlocked: chapterCompleted('query'),
  },
  {
    id: 'auth-explorer',
    title: { en: 'Auth Explorer', es: 'Auth Explorer' },
    description: { en: 'Complete Authentication.', es: 'Completa Autenticación.' },
    isUnlocked: chapterCompleted('auth'),
  },
  {
    id: 'api-debugger',
    title: { en: 'API Debugger', es: 'API Debugger' },
    description: { en: 'Solve the final API Detective incident.', es: 'Resuelve el incidente final de API Detective.' },
    isUnlocked: (completedIds) => completedIds.has('detective-8'),
  },
  {
    id: 'rest-master',
    title: { en: 'REST Master', es: 'REST Master' },
    description: { en: 'Complete all 56 missions.', es: 'Completa las 56 misiones.' },
    isUnlocked: (completedIds) => completedIds.size >= TOTAL_MISSIONS,
  },
  {
    id: NIGHT_SHIFT_ACHIEVEMENT,
    title: { en: 'Night Shift', es: 'Night Shift' },
    description: { en: 'Turn off the lights of the server room.', es: 'Apaga las luces de la sala de servidores.' },
    isUnlocked: () => false,
    secret: true,
  },
]

/**
 * Calculates the earned achievements.
 *
 * @param completedIds Identifiers of the completed missions.
 * @returns Identifiers of the earned achievements, in display order.
 */
export function unlockedAchievements(completedIds: string[]): string[] {
  const completed = new Set(completedIds)
  return achievements.filter((achievement) => achievement.isUnlocked(completed)).map((achievement) => achievement.id)
}

/**
 * Tells whether an achievement is secret. Secret achievements cannot be recalculated from
 * the completed missions, so progress has to keep them.
 *
 * @param id Identifier of the achievement.
 * @returns `true` when it is secret.
 */
export function isSecretAchievement(id: string): boolean {
  return achievements.some((achievement) => achievement.id === id && achievement.secret)
}
