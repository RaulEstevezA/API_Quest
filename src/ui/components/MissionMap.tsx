/**
 * Mission list: the route of chapters, reached from the main menu. The unlocking rules
 * are in `core/progress.ts`; each stop of the route is a `ChapterCard`.
 */

import { chapters } from '../../content/chapters'
import { uiText } from '../../content/ui-text'
import type { GameProgress } from '../../core/progress'
import type { Language } from '../i18n'
import { ChapterCard } from './ChapterCard'
import { ProgressSummary } from './ProgressSummary'
import { ScreenBar } from './ScreenBar'

const text = uiText.menu

interface MissionMapProps {
  language: Language
  progress: Pick<GameProgress, 'xp' | 'completedMissions'>
  onBack: () => void
  onOpenMission: (id: string) => void
}

/** Renders the chapters and their missions. */
export function MissionMap({ language, progress, onBack, onOpenMission }: MissionMapProps) {
  return (
    <>
      <ScreenBar backLabel={text.back[language]} onBack={onBack}>
        <ProgressSummary language={language} progress={progress} compact />
      </ScreenBar>
      <section className="chapter-list" aria-labelledby="chapters-title">
        <div className="section-heading">
          <div>
            <h1 id="chapters-title">{text.chapters[language]}</h1>
            <p>{text.chaptersHint[language]}</p>
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
    </>
  )
}
