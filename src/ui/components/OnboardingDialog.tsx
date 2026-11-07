/**
 * Modal that explains how to play. It uses the native `<dialog>`, which provides the
 * focus trap and closing with Escape. Whether it is open is decided by `use-onboarding`.
 */

import { useEffect, useRef } from 'react'
import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const text = uiText.onboarding

interface OnboardingDialogProps {
  language: Language
  open: boolean
  onClose: () => void
  onStart: () => void
}

/** Renders the dialog and keeps the native element in sync with the `open` prop. */
export function OnboardingDialog({ language, open, onClose, onStart }: OnboardingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="onboarding-dialog"
      aria-labelledby="onboarding-title"
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop targets the dialog itself rather than its content.
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <div className="onboarding-dialog__header">
        <div>
          <p className="eyebrow">{text.eyebrow[language]}</p>
          <h2 id="onboarding-title">{text.title[language]}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label={text.close[language]}
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </div>

      <div className="onboarding-dialog__body">
        <p className="onboarding-dialog__intro">{text.intro[language]}</p>

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

        <p className="onboarding-dialog__note">{text.tip[language]}</p>
      </div>

      <div className="onboarding-dialog__actions">
        <button className="button" type="button" onClick={() => dialogRef.current?.close()}>
          {text.explore[language]}
        </button>
        <button className="button button--primary" type="button" onClick={onStart}>
          {text.start[language]}
        </button>
      </div>
    </dialog>
  )
}
