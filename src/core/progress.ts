export const PROGRESS_VERSION = 1
export const PROGRESS_STORAGE_KEY = 'api-quest.progress'

export interface MissionProgress {
  completed: boolean
  bestXp: number
  attempts: number
  hintsUsed: number
}

export interface GameProgress {
  version: number
  xp: number
  completedMissions: Record<string, MissionProgress>
  achievements: string[]
  lastMissionId: string | null
}

export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createInitialProgress(): GameProgress {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    completedMissions: {},
    achievements: [],
    lastMissionId: null,
  }
}

function isProgress(value: unknown): value is GameProgress {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<GameProgress>
  return (
    candidate.version === PROGRESS_VERSION &&
    typeof candidate.xp === 'number' &&
    typeof candidate.completedMissions === 'object' &&
    Array.isArray(candidate.achievements)
  )
}

export function loadProgress(storage: StorageAdapter): GameProgress {
  try {
    const saved = storage.getItem(PROGRESS_STORAGE_KEY)
    if (!saved) return createInitialProgress()
    const parsed: unknown = JSON.parse(saved)
    return isProgress(parsed) ? parsed : createInitialProgress()
  } catch {
    return createInitialProgress()
  }
}

export function saveProgress(storage: StorageAdapter, progress: GameProgress): boolean {
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

export function resetProgress(storage: StorageAdapter): GameProgress {
  try {
    storage.removeItem(PROGRESS_STORAGE_KEY)
  } catch {
    // The in-memory reset still succeeds when browser storage is unavailable.
  }
  return createInitialProgress()
}

export function completeMission(
  progress: GameProgress,
  missionId: string,
  earnedXp: number,
  attempts: number,
  hintsUsed: number,
): GameProgress {
  const previousBest = progress.completedMissions[missionId]?.bestXp ?? 0
  const nextBest = Math.max(previousBest, earnedXp)
  const completedMissions = {
    ...progress.completedMissions,
    [missionId]: { completed: true, bestXp: nextBest, attempts, hintsUsed },
  }
  return {
    ...progress,
    xp: progress.xp - previousBest + nextBest,
    lastMissionId: missionId,
    achievements: unlockedAchievements(Object.keys(completedMissions)),
    completedMissions,
  }
}
import { unlockedAchievements } from './achievements'

