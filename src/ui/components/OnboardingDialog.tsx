/**
 * Window that explains how to play. Whether it is open is decided by `use-onboarding`,
 * and its texts are in the catalogue of `content/ui-text.ts`.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'
import { Modal } from './Modal'

const text = uiText.onboarding

interface OnboardingDialogProps {
  language: Language
  open: boolean
  onClose: () => void
  onStart: () => void
}

/** Renders the explanation and the two ways of leaving it. */
export function OnboardingDialog({ language, open, onClose, onStart }: OnboardingDialogProps) {
  return (
    <Modal
      language={language}
      open={open}
      onClose={onClose}
      eyebrow={text.eyebrow[language]}
      title={text.title[language]}
      actions={
        <>
          <button className="button" type="button" onClick={onClose}>
            {text.explore[language]}
          </button>
          <button className="button button--primary" type="button" onClick={onStart}>
            {text.start[language]}
          </button>
        </>
      }
    >
      <p className="onboarding-intro">{text.intro[language]}</p>

      <ol className="onboarding-steps">
        {text.steps.map((step, index) => (
          <li key={step.title.en}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title[language]}</strong>
              <p>{step.description[language]}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="onboarding-locations">
        {text.locations.map((location) => (
          <article key={location.title.en}>
            <h3>{location.title[language]}</h3>
            <p>{location.description[language]}</p>
          </article>
        ))}
      </div>

      <p className="onboarding-note">{text.tip[language]}</p>
    </Modal>
  )
}
