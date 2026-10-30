import { useEffect, useState } from 'react'
import {
  completeMission,
  createInitialProgress,
  loadProgress,
  resetProgress,
  saveProgress,
  type GameProgress,
} from '../core/progress'

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(() => {
    if (typeof localStorage === 'undefined') return createInitialProgress()
    return loadProgress(localStorage)
  })
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    if (!saveProgress(localStorage, progress)) setStorageAvailable(false)
  }, [progress])

  return {
    progress,
    storageAvailable,
    recordCompletion: (missionId: string, xp: number, attempts: number, hintsUsed: number) => {
      setProgress((current) => completeMission(current, missionId, xp, attempts, hintsUsed))
    },
    reset: () => setProgress(resetProgress(localStorage)),
  }
}
