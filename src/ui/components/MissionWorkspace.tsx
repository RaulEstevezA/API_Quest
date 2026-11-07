/**
 * Screen of a mission: brief, request builder, response and hints. It holds only
 * the state of the attempt in progress; validation and scoring come from `core/`.
 */

import { useMemo, useState } from 'react'
import { issueText, uiText } from '../../content/ui-text'
import { evaluateRequest, type EvaluationIssue } from '../../core/evaluate-request'
import { createEmptyRequest, type ApiRequest } from '../../core/http'
import type { Mission } from '../../core/missions'
import { calculateXp } from '../../core/scoring'
import { chapterEmblems } from '../art/emblems'
import { PixelArt } from '../art/PixelArt'
import type { Language } from '../i18n'
import { ApiReference } from './ApiReference'
import { Modal } from './Modal'
import { PacketWire } from './PacketWire'
import { RequestBuilder } from './RequestBuilder'
import { ResponseDetails, ResponsePane } from './ResponsePane'
import { ScreenBar } from './ScreenBar'

const text = uiText.mission

interface MissionWorkspaceProps {
  mission: Mission
  language: Language
  onBack: () => void
  /** Called once when the mission is solved, with the XP earned and the effort spent. */
  onComplete: (xp: number, attempts: number, hints: number) => void
  /** Opens the mission to play next, or `null` when there is nothing left to offer. */
  onNext: (() => void) | null
}

/** Creates the request the mission starts from, which may come prefilled so it can be repaired. */
function initialRequest(mission: Mission): ApiRequest {
  return {
    ...createEmptyRequest(),
    ...mission.starter,
    query: mission.starter?.query ?? [],
    headers: mission.starter?.headers ?? [],
  }
}

/** Renders the validation problems of a failed attempt. */
function IssueFeedback({ issues, language }: { issues: EvaluationIssue[]; language: Language }) {
  return (
    <div className="feedback feedback--error" role="alert">
      <strong>400 Bad Request</strong>
      <p>{text.notSolved[language]}</p>
      <ul>
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${index}`}>{issueText[issue.code](issue)[language]}</li>
        ))}
      </ul>
    </div>
  )
}

interface SolvedFeedbackProps {
  mission: Mission
  xp: number
  language: Language
  onNext: (() => void) | null
}

/** Renders the simulated response, the explanation, the XP and the way to the next mission. */
function SolvedFeedback({ mission, xp, language, onNext }: SolvedFeedbackProps) {
  // Some missions teach how to read an error, so a 4xx or 5xx can be the right outcome.
  const tone = mission.successResponse.status >= 400 ? 'feedback--expected-error' : 'feedback--success'

  return (
    <div className={`feedback ${tone}`} role="status">
      <ResponseDetails response={mission.successResponse} />
      <h3>{text.whyItWorks[language]}</h3>
      <p>{mission.explanation[language]}</p>
      <div className="feedback__result">
        <p className="xp-earned">+{xp} XP</p>
        {onNext && (
          <button className="button button--primary" type="button" onClick={onNext}>
            {text.next[language]} →
          </button>
        )}
      </div>
    </div>
  )
}

/** Renders a mission and manages its attempts. */
export function MissionWorkspace({ mission, language, onBack, onComplete, onNext }: MissionWorkspaceProps) {
  const [request, setRequest] = useState(() => initialRequest(mission))
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [issues, setIssues] = useState<EvaluationIssue[]>([])
  const [solved, setSolved] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)
  const xp = useMemo(
    () => calculateXp({ attempts: Math.max(attempts, 1), hintsUsed, baseXp: mission.xp }),
    [attempts, hintsUsed, mission.xp],
  )

  const send = () => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const result = evaluateRequest(mission, request)
    setIssues(result.issues)
    if (result.correct) {
      setSolved(true)
      onComplete(calculateXp({ attempts: nextAttempts, hintsUsed, baseXp: mission.xp }), nextAttempts, hintsUsed)
    }
  }

  return (
    <div className={`chapter-theme chapter-theme--${mission.chapter}`}>
      <ScreenBar backLabel={text.backToChapters[language]} onBack={onBack}>
        <button className="button button--small" type="button" onClick={() => setDocsOpen(true)}>
          {uiText.menu.docs[language]}
        </button>
        <span>{mission.service}</span>
        <span>
          {text.attempts[language]}: {attempts}
        </span>
        <span>{xp} XP</span>
      </ScreenBar>

      <section className="mission-brief mission-brief--ticket window">
        <div className="mission-brief__emblem">
          <PixelArt rows={chapterEmblems[mission.chapter]} />
        </div>
        <div>
          <p className="eyebrow">{text.position(mission.chapter, mission.order)[language]}</p>
          <h1>{mission.title[language]}</h1>
          <p>{mission.brief[language]}</p>
          <div className="objective">
            <strong>{text.objective[language]}</strong>
            <span>{mission.objective[language]}</span>
          </div>
        </div>
      </section>

      <div className="workspace">
        <PacketWire language={language} sendCount={attempts} />
        <RequestBuilder
          language={language}
          request={request}
          fields={mission.availableFields}
          solved={solved}
          onChange={setRequest}
          onSend={send}
        />
        <ResponsePane language={language}>
          {!solved && issues.length === 0 && <p className="empty-state">{text.noResponse[language]}</p>}
          {!solved && issues.length > 0 && <IssueFeedback issues={issues} language={language} />}
          {solved && <SolvedFeedback mission={mission} xp={xp} language={language} onNext={onNext} />}
        </ResponsePane>
      </div>

      {!solved && mission.hints.length > 0 && (
        <section className="hint-panel">
          <div>
            <h2>{text.hints[language]}</h2>
            {mission.hints.slice(0, hintsUsed).map((hint, index) => (
              <p key={index}>
                <strong>{index + 1}.</strong> {hint[language]}
              </p>
            ))}
          </div>
          {hintsUsed < mission.hints.length && (
            <button className="button" type="button" onClick={() => setHintsUsed((count) => count + 1)}>
              {text.showHint[language]}
            </button>
          )}
        </section>
      )}

      {/* A window rather than a screen, so that the request being written is not lost. */}
      <Modal
        language={language}
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        eyebrow={uiText.docs.eyebrow[language]}
        title={uiText.docs.title[language]}
        wide
      >
        <ApiReference language={language} />
      </Modal>
    </div>
  )
}
