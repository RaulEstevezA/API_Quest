/**
 * Top bar of every screen except the main menu: the way back on the left and,
 * optionally, a few indicators on the right. These screens have no header or menu,
 * so this bar is their only navigation.
 */

import type { ReactNode } from 'react'

interface ScreenBarProps {
  backLabel: string
  onBack: () => void
  /** Indicators shown on the right. */
  children?: ReactNode
}

/** Renders the bar. */
export function ScreenBar({ backLabel, onBack, children }: ScreenBarProps) {
  return (
    <div className="screen-bar">
      <button className="button" type="button" onClick={onBack}>
        ← {backLabel}
      </button>
      {children}
    </div>
  )
}
