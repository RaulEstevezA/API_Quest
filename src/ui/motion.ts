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

/**
 * Fades the current document before following a regular link. Modified clicks
 * keep their native behaviour so opening the destination in another tab works.
 */
export function followLinkWithPageFade(event: React.MouseEvent<HTMLAnchorElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  const destination = event.currentTarget.href
  if (prefersReducedMotion()) return

  event.preventDefault()
  document.documentElement.classList.add('page-is-leaving')
  window.setTimeout(() => window.location.assign(destination), 160)
}

/** Whether CSS can keep a closing dialog in the top layer for its transition. */
export function supportsDialogOverlay() {
  return Boolean(window.CSS?.supports?.('overlay', 'auto'))
}

/** Whether the player has requested effectively instant UI changes. */
export function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}
