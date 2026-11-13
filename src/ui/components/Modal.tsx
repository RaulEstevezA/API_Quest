/**
 * Emergent window of the game. It uses the native `<dialog>`, which provides the focus
 * trap and closing with Escape. The parent decides whether it is open, so every way of
 * closing it (Escape, the backdrop, the close button) ends up calling `onClose`.
 */

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'
import { prefersReducedMotion, supportsDialogOverlay } from '../motion'

interface ModalProps {
  language: Language
  open: boolean
  onClose: () => void
  eyebrow: string
  title: string
  /** `true` for content that needs room, such as the API reference. */
  wide?: boolean
  /** Extra classes of the window, such as the theme of a chapter. */
  className?: string
  /** Buttons fixed at the bottom, always visible while the content scrolls. */
  actions?: ReactNode
  children: ReactNode
}

/** Renders the window and keeps the native element in sync with the `open` prop. */
export function Modal({
  language,
  open,
  onClose,
  eyebrow,
  title,
  wide = false,
  className,
  actions,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) {
      if (supportsDialogOverlay() || prefersReducedMotion() || !dialog.animate) {
        dialog.close()
        return
      }

      // Safari and Firefox currently need a small fallback until `overlay`
      // can keep a closing dialog in the top layer. Values mirror the CSS tokens.
      const options: KeyframeAnimationOptions = { duration: 180, easing: 'ease-in', fill: 'forwards' }
      const closing = dialog.animate(
        { opacity: [1, 0], transform: ['none', 'scale(0.97)'] },
        options,
      )
      try {
        dialog.animate({ opacity: [1, 0] }, { ...options, pseudoElement: '::backdrop' })
      } catch {
        // Some engines cannot animate a pseudo-element through Web Animations.
      }
      closing.onfinish = () => {
        dialog.close()
        // `fill: forwards` must not leak the invisible final state into the
        // next opening of this reusable dialog.
        dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel())
      }
      return () => closing.cancel()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`modal${wide ? ' modal--wide' : ''}${className ? ` ${className}` : ''}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // A click on the backdrop targets the dialog itself rather than its content.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button className="icon-button" type="button" aria-label={uiText.modal.close[language]} onClick={onClose}>
          ×
        </button>
      </div>
      <div className="modal__body">{children}</div>
      {actions && <div className="modal__actions">{actions}</div>}
    </dialog>
  )
}
