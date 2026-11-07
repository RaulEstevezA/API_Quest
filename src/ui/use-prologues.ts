/**
 * Remembers which chapter prologues the player has already read, so that each one
 * appears on its own only once. They can still be reread from the chapter card.
 */

import { useState } from 'react'
import type { ChapterId } from '../core/missions'
import { safeRead, safeRemove, safeWrite, type StorageAdapter } from '../core/storage'

const PROLOGUES_STORAGE_KEY = 'api-quest.prologues-seen'

/** Reads the saved list. Unreadable data only means that a prologue may appear again. */
function loadSeen(storage: StorageAdapter): ChapterId[] {
  try {
    const parsed: unknown = JSON.parse(safeRead(storage, PROLOGUES_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as ChapterId[]) : []
  } catch {
    return []
  }
}

/**
 * Provides the prologues already read.
 *
 * @param storage Store that remembers them. Without storage, they last for the tab.
 * @returns A check for one chapter, and the actions that record and forget them.
 */
export function usePrologues(storage: StorageAdapter) {
  const [seen, setSeen] = useState(() => loadSeen(storage))

  return {
    hasSeen: (chapter: ChapterId) => seen.includes(chapter),
    markSeen: (chapter: ChapterId) => {
      if (seen.includes(chapter)) return
      const next = [...seen, chapter]
      setSeen(next)
      safeWrite(storage, PROLOGUES_STORAGE_KEY, JSON.stringify(next))
    },
    /** Starts the story again, for a player who resets their progress. */
    reset: () => {
      setSeen([])
      safeRemove(storage, PROLOGUES_STORAGE_KEY)
    },
  }
}
