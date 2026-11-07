/**
 * Initial menu of the game: overall progress, chapters and achievements. It shows
 * the state and reports the player's choices; the rules are in `core/progress.ts`.
 */

import { chapters } from '../../content/chapters'
import { getChapterMissions, missions } from '../../content/missions'
import { uiText } from '../../content/ui-text'
import { achievements } from '../../core/achievements'
import type { Chapter } from '../../core/missions'
import { isChapterUnlocked, type GameProgress } from '../../core/progress'
import type { Language } from '../i18n'

const text = uiText.dashboard

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

interface ChapterCardProps {
  chapter: Chapter
  language: Language
  completedMissions: GameProgress['completedMissions']
  onOpenMission: (id: string) => void
}

/** Renders a chapter with its missions, or its locked state. */
function ChapterCard({ chapter, language, completedMissions, onOpenMission }: ChapterCardProps) {
  const chapterMissions = getChapterMissions(chapter.id)
  const previousMissions = getChapterMissions(chapter.id - 1).map((mission) => mission.id)
  const unlocked = isChapterUnlocked(chapter.id, previousMissions, { completedMissions })
  const completedCount = chapterMissions.filter((mission) => completedMissions[mission.id]).length

  return (
    <article className={`chapter-card${unlocked ? '' : ' chapter-card--locked'}`}>
      <div className="chapter-card__heading">
        <span className="chapter-card__number">{String(chapter.id).padStart(2, '0')}</span>
        <div>
          <h3>{chapter.title[language]}</h3>
          <p>{chapter.description[language]}</p>
        </div>
        <span className="badge">
          {unlocked ? `${completedCount} / ${chapterMissions.length}` : text.locked[language]}
        </span>
      </div>
      {unlocked && chapterMissions.length > 0 && (
        <ol className="mission-list">
          {chapterMissions.map((mission) => {
            const done = completedMissions[mission.id]
            return (
              <li key={mission.id}>
                <button type="button" onClick={() => onOpenMission(mission.id)}>
                  <span>
                    {mission.order}. {mission.title[language]}
                  </span>
                  <span className={done ? 'status status--success' : 'status'}>
                    {done ? `${done.bestXp} XP` : text.pending[language]}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
      {unlocked && chapterMissions.length === 0 && <p className="empty-state">{text.chapterInPreparation[language]}</p>}
    </article>
  )
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
  const completed = Object.keys(progress.completedMissions).length

  return (
    <>
      <section className="hero window" aria-labelledby="app-title">
        <div className="hero__heading">
          <div className="hero__brand">
            <img
              className="game-logo"
              src={`${import.meta.env.BASE_URL}api-quest-logo.png`}
              alt=""
              width="72"
              height="72"
            />
            <div>
              <h1 id="app-title">API Quest</h1>
              <p className="subtitle">{text.subtitle[language]}</p>
            </div>
          </div>
          <dl className="progress-summary">
            <div>
              <dt>XP</dt>
              <dd>{progress.xp}</dd>
            </div>
            <div>
              <dt>{text.missions[language]}</dt>
              <dd>
                {completed} / {missions.length}
              </dd>
            </div>
          </dl>
        </div>
        <p className="hero__description">{text.description[language]}</p>
      </section>

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
