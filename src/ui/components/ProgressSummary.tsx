/**
 * XP and mission counter, shown on the mission list. To move or remove the marker,
 * change only the screens that render it.
 */

import { missions } from '../../content/missions'
import { uiText } from '../../content/ui-text'
import type { GameProgress } from '../../core/progress'
import type { Language } from '../i18n'

interface ProgressSummaryProps {
  language: Language
  progress: Pick<GameProgress, 'xp' | 'completedMissions'>
  /** `true` for the single-line version used inside a screen bar. */
  compact?: boolean
}

/** Renders the player's XP and completed missions. */
export function ProgressSummary({ language, progress, compact = false }: ProgressSummaryProps) {
  const completed = Object.keys(progress.completedMissions).length

  return (
    <dl className={`progress-summary${compact ? ' progress-summary--compact' : ''}`}>
      <div>
        <dt>XP</dt>
        <dd>{progress.xp}</dd>
      </div>
      <div>
        <dt>{uiText.menu.missions[language]}</dt>
        <dd>
          {completed} / {missions.length}
        </dd>
      </div>
      <div className="progress-summary__bar" aria-hidden="true">
        <i style={{ width: `${(completed / missions.length) * 100}%` }} />
      </div>
    </dl>
  )
}
