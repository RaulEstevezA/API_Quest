/**
 * Achievements screen. The list and the unlock rules are in `core/achievements.ts`;
 * this screen only shows which ones the player has earned.
 */

import { uiText } from '../../content/ui-text'
import { achievements } from '../../core/achievements'
import type { GameProgress } from '../../core/progress'
import { medalEmblem } from '../art/emblems'
import { PixelArt } from '../art/PixelArt'
import type { Language } from '../i18n'

const text = uiText.menu

interface AchievementsScreenProps {
  language: Language
  earned: GameProgress['achievements']
}

/** Renders every achievement with its state in text. */
export function AchievementsScreen({ language, earned }: AchievementsScreenProps) {
  return (
    <section className="achievements" aria-labelledby="achievements-title">
      <div className="section-heading">
        <div>
          <h1 id="achievements-title">{text.achievements[language]}</h1>
          <p>{text.achievementsHint[language]}</p>
        </div>
      </div>
      <div className="achievement-list">
        {achievements.map((achievement) => {
          const unlocked = earned.includes(achievement.id)
          return (
            <article className={`achievement${unlocked ? ' achievement--unlocked' : ''}`} key={achievement.id}>
              <PixelArt rows={medalEmblem} />
              <span className="achievement__state">{(unlocked ? text.earned : text.pending)[language]}</span>
              <h3>{achievement.title[language]}</h3>
              <p>{achievement.description[language]}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
