/**
 * Emergent window of the game. It uses the native `<dialog>`, which provides the focus
 * trap and closing with Escape. The parent decides whether it is open, so every way of
 * closing it (Escape, the backdrop, the close button) ends up calling `onClose`.
 */

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

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
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`modal${wide ? ' modal--wide' : ''}${className ? ` ${className}` : ''}`}
      aria-labelledby={titleId}
      onClose={onClose}
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
