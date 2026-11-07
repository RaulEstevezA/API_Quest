/**
 * Connects the progress rules of the core to React state. The state in memory is
 * the source of truth during the session, and every change is saved automatically.
 */

import { useEffect, useState } from 'react'
import { completeMission, earnAchievement, loadProgress, resetProgress, saveProgress } from '../core/progress'
import type { StorageAdapter } from '../core/storage'

/**
 * Provides the player's progress and the actions that change it.
 *
 * @param storage Store that holds the progress.
 * @returns The progress, the storage warnings to show, and the actions that change it.
 */
export function useGameProgress(storage: StorageAdapter) {
  const [initial] = useState(() => loadProgress(storage))
  const [progress, setProgress] = useState(initial.progress)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [progressWasReset, setProgressWasReset] = useState(initial.status === 'reset')

  useEffect(() => {
    setStorageAvailable(saveProgress(storage, progress))
  }, [storage, progress])

  return {
    progress,
    storageAvailable,
    progressWasReset,
    recordCompletion: (missionId: string, xp: number, attempts: number, hintsUsed: number) => {
      setProgress((current) => completeMission(current, missionId, xp, attempts, hintsUsed))
    },
    earnAchievement: (id: string) => setProgress((current) => earnAchievement(current, id)),
    reset: () => {
      setProgress(resetProgress(storage))
      setProgressWasReset(false)
    },
  }
}
