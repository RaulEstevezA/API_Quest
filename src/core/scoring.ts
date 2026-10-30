export interface ScoreInput {
  attempts: number
  hintsUsed: number
  baseXp: number
}

export function calculateXp({ attempts, hintsUsed, baseXp }: ScoreInput): number {
  if (hintsUsed > 0) return Math.round(baseXp * 0.5)
  if (attempts <= 1) return baseXp
  if (attempts === 2) return Math.round(baseXp * 0.75)
  return Math.round(baseXp * 0.5)
}
