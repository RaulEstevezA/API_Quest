/** Window that tells the story of a chapter. Its texts are in `content/prologues.ts`. */

import { PROLOGUE_SPEAKER, prologues } from '../../content/prologues'
import type { ChapterId } from '../../core/missions'
import { chapterArtUrl } from '../art/chapter-art'
import type { Language } from '../i18n'
import { Modal } from './Modal'

interface ChapterPrologueProps {
  language: Language
  chapter: ChapterId
  onClose: () => void
}

/** Renders the prologue. It is open for as long as it is rendered. */
export function ChapterPrologue({ language, chapter, onClose }: ChapterPrologueProps) {
  const prologue = prologues[chapter]

  return (
    <Modal
      language={language}
      open
      onClose={onClose}
      eyebrow={prologue.signal[language]}
      title={prologue.title[language]}
      className={`chapter-theme chapter-theme--${chapter}`}
      actions={
        <button className="button button--primary" type="button" onClick={onClose}>
          {prologue.action[language]}
        </button>
      }
    >
      <div className="prologue">
        <img className="prologue__art" src={chapterArtUrl(chapter)} alt="" width="1280" height="720" />
        {prologue.paragraphs[language].map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <blockquote>
          <b>{PROLOGUE_SPEAKER}</b>
          <p>{prologue.quote[language]}</p>
        </blockquote>
      </div>
    </Modal>
  )
}
