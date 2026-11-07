/**
 * Small traffic light that repeats the family of an HTTP status code, the same one
 * the Status Codes chapter uses as its emblem. The status line always says the result
 * in text, so this is hidden from screen readers.
 */

/** Renders the three lights, with the one for the status family lit. */
export function StatusLights({ status }: { status: number }) {
  const lit = status >= 500 ? 'red' : status >= 400 ? 'yellow' : 'green'

  return (
    <span className="status-lights" aria-hidden="true">
      {['green', 'yellow', 'red'].map((color) => (
        <i className={`status-lights__led status-lights__led--${color}${color === lit ? ' is-on' : ''}`} key={color} />
      ))}
    </span>
  )
}
