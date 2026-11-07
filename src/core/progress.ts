/**
 * Game progress rules: creation, versioned persistence, mission completion, chapter
 * unlocking and choosing the next mission. Pure functions only; storage is received through
 * `StorageAdapter`, and the mission catalogue through parameters.
 *
 * To change the saved format, increase `PROGRESS_VERSION`. Saved data from another
 * version is reported as `reset`, so the interface can tell the player about it:
 * progress must never be lost silently.
 */

import { isSecretAchievement, unlockedAchievements } from './achievements'
import { safeRead, safeRemove, safeWrite, type StorageAdapter } from './storage'

/** Version of the saved format. Saved data with another version is not restored. */
export const PROGRESS_VERSION = 1

/** Key of the saved progress, following the `<game>.progress` convention. */
export const PROGRESS_STORAGE_KEY = 'api-quest.progress'

/** Best result of a mission and the effort spent on its latest completion. */
export interface MissionProgress {
  completed: boolean
  bestXp: number
  attempts: number
  hintsUsed: number
}

/** Everything saved about a player. */
export interface GameProgress {
  version: number
  xp: number
  completedMissions: Record<string, MissionProgress>
  achievements: string[]
  lastMissionId: string | null
}

/**
 * Outcome of reading saved progress:
 * - `new`: nothing was saved, or storage is unavailable.
 * - `restored`: the saved progress was recovered.
 * - `reset`: data existed but was unreadable or from another version, so it was replaced.
 */
export type ProgressLoadStatus = 'new' | 'restored' | 'reset'

/** Progress to play with and how it was obtained. */
export interface ProgressLoadResult {
  progress: GameProgress
  status: ProgressLoadStatus
}

/** Creates the progress of a player who has not completed anything. */
export function createInitialProgress(): GameProgress {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    completedMissions: {},
    achievements: [],
    lastMissionId: null,
  }
}

/** Checks that an unknown value has the shape and version of the current format. */
function isProgress(value: unknown): value is GameProgress {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<GameProgress>
  return (
    candidate.version === PROGRESS_VERSION &&
    typeof candidate.xp === 'number' &&
    typeof candidate.completedMissions === 'object' &&
    candidate.completedMissions !== null &&
    Array.isArray(candidate.achievements)
  )
}

/**
 * Reads saved progress.
 *
 * @param storage Store that holds the progress.
 * @returns The progress to play with, plus a status that tells a first visit
 * apart from saved data that could not be restored. It does not throw.
 */
export function loadProgress(storage: Pick<StorageAdapter, 'getItem'>): ProgressLoadResult {
  const saved = safeRead(storage, PROGRESS_STORAGE_KEY)
  if (!saved) return { progress: createInitialProgress(), status: 'new' }
  try {
    const parsed: unknown = JSON.parse(saved)
    if (isProgress(parsed)) return { progress: parsed, status: 'restored' }
  } catch {
    // Corrupted JSON is handled below, exactly like an incompatible version.
  }
  return { progress: createInitialProgress(), status: 'reset' }
}

/**
 * Saves progress.
 *
 * @param storage Store that receives the progress.
 * @param progress Progress to save.
 * @returns `false` when storage rejected the write, so the player can be warned.
 */
export function saveProgress(storage: Pick<StorageAdapter, 'setItem'>, progress: GameProgress): boolean {
  return safeWrite(storage, PROGRESS_STORAGE_KEY, JSON.stringify(progress))
}

/**
 * Deletes saved progress. The reset succeeds in memory even if storage fails.
 *
 * @param storage Store that holds the progress.
 * @returns Progress for a player starting again.
 */
export function resetProgress(storage: Pick<StorageAdapter, 'removeItem'>): GameProgress {
  safeRemove(storage, PROGRESS_STORAGE_KEY)
  return createInitialProgress()
}

/**
 * Records a solved mission. Replaying a mission can improve its score but never
 * lowers it, so total XP only grows by the difference with the previous best.
 *
 * @param progress Current progress. It is not mutated.
 * @param missionId Solved mission.
 * @param earnedXp XP earned in this attempt.
 * @param attempts Attempts spent in this completion.
 * @param hintsUsed Hints revealed in this completion.
 * @returns The new progress, with achievements recalculated.
 */
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
    achievements: [
      ...unlockedAchievements(Object.keys(completedMissions)),
      ...progress.achievements.filter(isSecretAchievement),
    ],
    completedMissions,
  }
}

/**
 * Records an achievement earned by an action rather than by missions.
 *
 * @param progress Current progress. It is not mutated.
 * @param id Identifier of the achievement.
 * @returns The new progress, or the same one if it was already earned.
 */
export function earnAchievement(progress: GameProgress, id: string): GameProgress {
  return progress.achievements.includes(id) ? progress : { ...progress, achievements: [...progress.achievements, id] }
}

/**
 * Decides whether a chapter can be played: the first one always can, and each of
 * the others requires every mission of the previous chapter.
 *
 * @param chapter Number of the chapter.
 * @param previousChapterMissions Identifiers of the missions of the previous chapter.
 * @param progress Current progress.
 * @returns `true` when the chapter is unlocked.
 */
export function isChapterUnlocked(
  chapter: number,
  previousChapterMissions: readonly string[],
  progress: Pick<GameProgress, 'completedMissions'>,
): boolean {
  return chapter === 1 || previousChapterMissions.every((id) => progress.completedMissions[id])
}

/** The fields of a mission that decide the playing order. */
type MissionInOrder = { id: string; chapter: number }

/**
 * Finds the mission a returning player should continue with. Chapters unlock in order,
 * so the first pending mission of the catalogue is always playable.
 *
 * @param missions Every mission, in playing order.
 * @param progress Current progress.
 * @returns Its identifier, or `null` when every mission is complete.
 */
export function findFirstPendingMission(
  missions: readonly MissionInOrder[],
  progress: Pick<GameProgress, 'completedMissions'>,
): string | null {
  return missions.find((mission) => !progress.completedMissions[mission.id])?.id ?? null
}

/**
 * Finds the mission to offer after solving one: the following mission of the catalogue,
 * unless its chapter is still locked or there is none, which happens when replaying an
 * earlier mission. In those cases it offers the first pending mission instead.
 *
 * @param missions Every mission, in playing order.
 * @param currentId Mission just solved.
 * @param progress Progress that already includes that mission.
 * @returns Its identifier, or `null` when there is nothing left to offer.
 */
export function findNextMission(
  missions: readonly MissionInOrder[],
  currentId: string,
  progress: Pick<GameProgress, 'completedMissions'>,
): string | null {
  const next = missions[missions.findIndex((mission) => mission.id === currentId) + 1]
  if (!next) return findFirstPendingMission(missions, progress)
  const previousChapter = missions.filter((mission) => mission.chapter === next.chapter - 1).map((mission) => mission.id)
  return isChapterUnlocked(next.chapter, previousChapter, progress)
    ? next.id
    : findFirstPendingMission(missions, progress)
}
