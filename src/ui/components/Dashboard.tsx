import { chapters } from '../../content/chapters'
import { getChapterMissions } from '../../content/missions'
import type { GameProgress } from '../../core/progress'
import type { Language } from '../i18n'

interface DashboardProps {
  language: Language
  progress: GameProgress
  storageAvailable: boolean
  onOpenMission: (id: string) => void
  onReset: () => void
}

export function Dashboard({ language, progress, storageAvailable, onOpenMission, onReset }: DashboardProps) {
  const completed = Object.keys(progress.completedMissions).length
  const isChapterUnlocked = (chapter: number) => chapter === 1 || getChapterMissions(chapter - 1).every((mission) => progress.completedMissions[mission.id])

  return (
    <>
      <section className="hero window" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">REST API training</p>
          <h1 id="app-title">API Quest</h1>
          <p className="subtitle">
            {language === 'es'
              ? 'Aprende cómo funcionan las APIs construyendo peticiones, leyendo respuestas y resolviendo tareas de desarrollo.'
              : 'Learn how APIs work by building requests, reading responses, and solving realistic development tasks.'}
          </p>
        </div>
        <dl className="progress-summary">
          <div><dt>XP</dt><dd>{progress.xp}</dd></div>
          <div><dt>{language === 'es' ? 'Misiones' : 'Missions'}</dt><dd>{completed} / 56</dd></div>
        </dl>
      </section>

      {!storageAvailable && (
        <p className="notice notice--warning" role="status">
          {language === 'es' ? 'El progreso durará solo durante esta pestaña porque el almacenamiento local no está disponible.' : 'Progress will last only for this tab because local storage is unavailable.'}
        </p>
      )}

      <section className="chapter-list" aria-labelledby="chapters-title">
        <div className="section-heading">
          <div><h2 id="chapters-title">{language === 'es' ? 'Capítulos' : 'Chapters'}</h2><p>{language === 'es' ? 'Completa un capítulo para desbloquear el siguiente.' : 'Complete a chapter to unlock the next one.'}</p></div>
          <button className="button" type="button" onClick={onReset}>{language === 'es' ? 'Reiniciar progreso' : 'Reset progress'}</button>
        </div>
        {chapters.map((chapter) => {
          const chapterMissions = getChapterMissions(chapter.id)
          const unlocked = isChapterUnlocked(chapter.id)
          const count = chapterMissions.filter((mission) => progress.completedMissions[mission.id]).length
          return (
            <article className={`chapter-card${unlocked ? '' : ' chapter-card--locked'}`} key={chapter.id}>
              <div className="chapter-card__heading">
                <span className="chapter-card__number">{String(chapter.id).padStart(2, '0')}</span>
                <div><h3>{chapter.title[language]}</h3><p>{chapter.description[language]}</p></div>
                <span className="badge">{unlocked ? `${count} / ${chapterMissions.length}` : (language === 'es' ? 'Bloqueado' : 'Locked')}</span>
              </div>
              {unlocked && chapterMissions.length > 0 && (
                <ol className="mission-list">
                  {chapterMissions.map((mission) => {
                    const done = progress.completedMissions[mission.id]
                    return <li key={mission.id}><button type="button" onClick={() => onOpenMission(mission.id)}><span>{mission.order}. {mission.title[language]}</span><span className={done ? 'status status--success' : 'status'}>{done ? `${done.bestXp} XP` : (language === 'es' ? 'Pendiente' : 'Pending')}</span></button></li>
                  })}
                </ol>
              )}
              {unlocked && chapterMissions.length === 0 && <p className="empty-state">{language === 'es' ? 'Las misiones de este capítulo están en preparación.' : 'This chapter’s missions are being prepared.'}</p>}
            </article>
          )
        })}
      </section>
    </>
  )
}
