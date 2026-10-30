import type { Mission } from '../core/missions'
import { chapter1 } from './chapter-1'
import { chapter2 } from './chapter-2'
import { chapter3 } from './chapter-3'
import { chapter4 } from './chapter-4'
import { chapter5 } from './chapter-5'
import { chapter6 } from './chapter-6'
import { chapter7 } from './chapter-7'

export const missions: Mission[] = [...chapter1, ...chapter2, ...chapter3, ...chapter4, ...chapter5, ...chapter6, ...chapter7]

export function getMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}

export function getChapterMissions(chapter: number): Mission[] {
  return missions.filter((mission) => mission.chapter === chapter).sort((a, b) => a.order - b.order)
}
