/** Motion helpers that implement the fade-in protocol from personal_web_style. */

/** Runs a UI change inside the canonical page fade when the browser supports it. */
export function withPageFade(update: () => void) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const startViewTransition = document.startViewTransition

  if (!startViewTransition || reduceMotion) {
    update()
    return
  }

  startViewTransition.call(document, update)
}

/** Whether CSS can keep a closing dialog in the top layer for its transition. */
export function supportsDialogOverlay() {
  return Boolean(window.CSS?.supports?.('overlay', 'auto'))
}

/** Whether the player has requested effectively instant UI changes. */
export function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}
