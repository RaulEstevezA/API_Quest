import type { Mission } from '../core/missions'
import { chapter1 } from './chapter-1'
import { chapter2 } from './chapter-2'

export const missions: Mission[] = [...chapter1, ...chapter2]

export function getMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}

export function getChapterMissions(chapter: number): Mission[] {
  return missions.filter((mission) => mission.chapter === chapter).sort((a, b) => a.order - b.order)
}
