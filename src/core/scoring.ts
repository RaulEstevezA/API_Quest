/**
 * XP scoring rule. It lives apart from the progress rules because it changes for
 * different reasons: game balance rather than saved data.
 */

/** Data the score depends on. */
export interface ScoreInput {
  attempts: number
  hintsUsed: number
  baseXp: number
}

/**
 * Calculates the XP of a solved mission: all of it at the first attempt, 75% at the
 * second, and 50% from the third attempt on or after using any hint.
 *
 * @param input Attempts, hints used and XP of the mission.
 * @returns XP earned, rounded to a whole number.
 */
export function calculateXp({ attempts, hintsUsed, baseXp }: ScoreInput): number {
  if (hintsUsed > 0) return Math.round(baseXp * 0.5)
  if (attempts <= 1) return baseXp
  if (attempts === 2) return Math.round(baseXp * 0.75)
  return Math.round(baseXp * 0.5)
}
