/**
 * Initial menu of the game. It composes the title, the storage notices, the chapter
 * route and the achievements, and reports the player's choices to `App`.
 */

import { chapters } from '../../content/chapters'
import { missions } from '../../content/missions'
import { uiText } from '../../content/ui-text'
import { achievements } from '../../core/achievements'
import type { GameProgress } from '../../core/progress'
import { medalEmblem } from '../art/emblems'
import { PixelArt } from '../art/PixelArt'
import type { Language } from '../i18n'
import { ChapterCard } from './ChapterCard'
import { TitleScreen } from './TitleScreen'

const text = uiText.menu

interface DashboardProps {
  language: Language
  progress: Pick<GameProgress, 'xp' | 'completedMissions' | 'achievements'>
  /** `false` when progress cannot be saved and will only last for this tab. */
  storageAvailable: boolean
  /** `true` when saved progress could not be restored and was replaced. */
  progressWasReset: boolean
  onOpenMission: (id: string) => void
  onReset: () => void
}

/** Renders the initial menu. */
export function Dashboard({
  language,
  progress,
  storageAvailable,
  progressWasReset,
  onOpenMission,
  onReset,
}: DashboardProps) {
  return (
    <>
      <TitleScreen
        language={language}
        xp={progress.xp}
        completed={Object.keys(progress.completedMissions).length}
        total={missions.length}
      />

      {!storageAvailable && (
        <p className="notice notice--warning" role="status">
          {text.storageUnavailable[language]}
        </p>
      )}
      {progressWasReset && (
        <p className="notice notice--warning" role="status">
          {text.progressReset[language]}
        </p>
      )}

      <section className="chapter-list" aria-labelledby="chapters-title">
        <div className="section-heading">
          <div>
            <h2 id="chapters-title">{text.chapters[language]}</h2>
            <p>{text.chaptersHint[language]}</p>
          </div>
          <div className="section-actions">
            <button className="button" type="button" onClick={onReset}>
              {text.resetProgress[language]}
            </button>
            <a className="button" href="../">
              {text.games[language]}
            </a>
          </div>
        </div>
        {chapters.map((chapter) => (
          <ChapterCard
            chapter={chapter}
            language={language}
            completedMissions={progress.completedMissions}
            onOpenMission={onOpenMission}
            key={chapter.id}
          />
        ))}
      </section>

      <section className="achievements" aria-labelledby="achievements-title">
        <div className="section-heading">
          <div>
            <h2 id="achievements-title">{text.achievements[language]}</h2>
            <p>{text.achievementsHint[language]}</p>
          </div>
        </div>
        <div className="achievement-list">
          {achievements.map((achievement) => {
            const unlocked = progress.achievements.includes(achievement.id)
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
    </>
  )
}
