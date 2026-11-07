/**
 * A stop on the chapter route of the initial menu: its emblem, its progress and its
 * missions. Whether it is unlocked is decided by `core/progress.ts`.
 */

import { getChapterMissions } from '../../content/missions'
import { uiText } from '../../content/ui-text'
import type { Chapter } from '../../core/missions'
import { isChapterUnlocked, type GameProgress } from '../../core/progress'
import { chapterEmblems, lockEmblem } from '../art/emblems'
import { PixelArt } from '../art/PixelArt'
import type { Language } from '../i18n'

const text = uiText.menu

interface ChapterCardProps {
  chapter: Chapter
  language: Language
  completedMissions: GameProgress['completedMissions']
  onOpenMission: (id: string) => void
  onReadPrologue: () => void
}

/** Renders a chapter with its missions, or its locked state. */
export function ChapterCard({ chapter, language, completedMissions, onOpenMission, onReadPrologue }: ChapterCardProps) {
  const chapterMissions = getChapterMissions(chapter.id)
  const previousMissions = getChapterMissions(chapter.id - 1).map((mission) => mission.id)
  const unlocked = isChapterUnlocked(chapter.id, previousMissions, { completedMissions })
  const completedCount = chapterMissions.filter((mission) => completedMissions[mission.id]).length

  return (
    <article
      className={`chapter-card chapter-theme chapter-theme--${chapter.id}${unlocked ? '' : ' chapter-card--locked'}`}
    >
      <div className="chapter-card__emblem">
        <PixelArt rows={unlocked ? chapterEmblems[chapter.id] : lockEmblem} />
        <span className="chapter-card__number">{String(chapter.id).padStart(2, '0')}</span>
      </div>

      <div className="chapter-card__content">
        <div className="chapter-card__heading">
          <div>
            <h3>{chapter.title[language]}</h3>
            <p>{chapter.description[language]}</p>
          </div>
          <div className="chapter-card__actions">
            {unlocked && (
              <button className="button button--small" type="button" onClick={onReadPrologue}>
                {text.briefing[language]}
              </button>
            )}
            <span className="badge">
              {unlocked ? `${completedCount} / ${chapterMissions.length}` : text.locked[language]}
            </span>
          </div>
        </div>

        {unlocked && (
          <div className="chapter-card__segments" aria-hidden="true">
            {chapterMissions.map((mission, index) => (
              <i className={index < completedCount ? 'is-filled' : undefined} key={mission.id} />
            ))}
          </div>
        )}

        {unlocked && chapterMissions.length > 0 && (
          <ol className="mission-list">
            {chapterMissions.map((mission) => {
              const done = completedMissions[mission.id]
              return (
                <li key={mission.id}>
                  <button
                    className={done ? 'mission-tile mission-tile--done' : 'mission-tile'}
                    type="button"
                    onClick={() => onOpenMission(mission.id)}
                  >
                    <b>{String(mission.order).padStart(2, '0')}</b>
                    <span>{mission.title[language]}</span>
                    <small>{done ? `${done.bestXp} XP` : text.pending[language]}</small>
                  </button>
                </li>
              )
            })}
          </ol>
        )}

        {unlocked && chapterMissions.length === 0 && (
          <p className="empty-state">{text.chapterInPreparation[language]}</p>
        )}
      </div>
    </article>
  )
}
