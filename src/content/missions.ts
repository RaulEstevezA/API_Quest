/**
 * Registry of missions (Registry pattern).
 *
 * To add a mission, declare it in its chapter file. To add a chapter, create its
 * file, list it here and describe it in `chapters.ts`. The engine does not change.
 */

import type { Mission } from '../core/missions'
import { chapter1 } from './chapter-1'
import { chapter2 } from './chapter-2'
import { chapter3 } from './chapter-3'
import { chapter4 } from './chapter-4'
import { chapter5 } from './chapter-5'
import { chapter6 } from './chapter-6'
import { chapter7 } from './chapter-7'

/** Every mission of the game. */
export const missions: Mission[] = [
  ...chapter1,
  ...chapter2,
  ...chapter3,
  ...chapter4,
  ...chapter5,
  ...chapter6,
  ...chapter7,
]

/**
 * Finds a mission.
 *
 * @param id Identifier of the mission.
 * @returns The mission, or `undefined` if it does not exist.
 */
export function getMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}

/**
 * Lists the missions of a chapter.
 *
 * @param chapter Number of the chapter.
 * @returns Its missions in playing order; empty if the chapter does not exist.
 */
export function getChapterMissions(chapter: number): Mission[] {
  return missions.filter((mission) => mission.chapter === chapter).sort((a, b) => a.order - b.order)
}
