/**
 * Decorative cable between the player and the API. A packet runs along it on every
 * send, which shows the request-response round trip the game teaches. The result of
 * the request is always stated in the response pane, so this is hidden from screen readers.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

interface PacketWireProps {
  language: Language
  /** Number of requests sent. Each new value starts a new trip. */
  sendCount: number
}

/** Renders the cable and, after the first send, the travelling packet. */
export function PacketWire({ language, sendCount }: PacketWireProps) {
  return (
    <div className="packet-wire" aria-hidden="true">
      <span>{uiText.response.client[language]}</span>
      <div className="packet-wire__line">{sendCount > 0 && <i key={sendCount} />}</div>
      <span>API</span>
    </div>
  )
}
