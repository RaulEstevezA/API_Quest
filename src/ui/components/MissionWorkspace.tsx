import { useMemo, useState } from 'react'
import type { EvaluationIssue } from '../../core/evaluate-request'
import { evaluateRequest } from '../../core/evaluate-request'
import { createEmptyRequest, type ApiRequest } from '../../core/http'
import type { Mission } from '../../core/missions'
import { calculateXp } from '../../core/scoring'
import type { Language } from '../i18n'
import { RequestBuilder } from './RequestBuilder'

interface Props { mission: Mission; language: Language; onBack: () => void; onComplete: (xp: number, attempts: number, hints: number) => void }

function initialRequest(mission: Mission): ApiRequest {
  return { ...createEmptyRequest(), ...mission.starter, query: mission.starter?.query ?? [], headers: mission.starter?.headers ?? [] }
}

function issueText(issue: EvaluationIssue, language: Language) {
  const texts: Record<EvaluationIssue['code'], [string, string]> = {
    method: [`Use ${issue.expected}, not ${issue.received}.`, `Usa ${issue.expected}, no ${issue.received}.`],
    path: [`The endpoint should be ${issue.expected}.`, `El endpoint debe ser ${issue.expected}.`],
    'query-missing': [`Check the query parameter “${issue.key}”.`, `Revisa el parámetro query «${issue.key}».`],
    'query-unexpected': [`The query parameter “${issue.key}” is not needed.`, `No necesitas el parámetro query «${issue.key}».`],
    'header-missing': [`Check the “${issue.key}” header.`, `Revisa el header «${issue.key}».`],
    'header-unexpected': [`The “${issue.key}” header is not needed.`, `No necesitas el header «${issue.key}».`],
    'body-missing': ['Add the required JSON body.', 'Añade el cuerpo JSON requerido.'],
    'body-invalid-json': ['The body is not valid JSON. Check quotes, commas, and values.', 'El cuerpo no es JSON válido. Revisa comillas, comas y valores.'],
    'body-mismatch': ['The JSON is valid, but its fields or values do not match the task.', 'El JSON es válido, pero sus campos o valores no coinciden con la tarea.'],
  }
  return texts[issue.code][language === 'es' ? 1 : 0]
}

export function MissionWorkspace({ mission, language, onBack, onComplete }: Props) {
  const [request, setRequest] = useState(() => initialRequest(mission))
  const [attempts, setAttempts] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [issues, setIssues] = useState<EvaluationIssue[]>([])
  const [solved, setSolved] = useState(false)
  const xp = useMemo(() => calculateXp({ attempts: Math.max(attempts, 1), hintsUsed, baseXp: mission.xp }), [attempts, hintsUsed, mission.xp])

  const send = () => {
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const result = evaluateRequest(mission, request)
    setIssues(result.issues)
    if (result.correct) {
      const earned = calculateXp({ attempts: nextAttempts, hintsUsed, baseXp: mission.xp })
      setSolved(true)
      onComplete(earned, nextAttempts, hintsUsed)
    }
  }

  return <>
    <div className="mission-toolbar"><button className="button" type="button" onClick={onBack}>← {language === 'es' ? 'Capítulos' : 'Chapters'}</button><span>{mission.service}</span><span>{language === 'es' ? 'Intentos' : 'Attempts'}: {attempts}</span><span>{xp} XP</span></div>
    <section className="mission-brief window"><p className="eyebrow">{language === 'es' ? `Capítulo ${mission.chapter} · Misión ${mission.order}` : `Chapter ${mission.chapter} · Mission ${mission.order}`}</p><h1>{mission.title[language]}</h1><p>{mission.brief[language]}</p><div className="objective"><strong>{language === 'es' ? 'Objetivo' : 'Objective'}</strong><span>{mission.objective[language]}</span></div></section>
    <div className="workspace">
      <RequestBuilder language={language} request={request} fields={mission.availableFields} disabled={solved} onChange={setRequest} onSend={send} />
      <section className="pane response-pane" aria-labelledby="response-title"><div className="pane__header"><h2 id="response-title">Response</h2></div><div className="pane__body">
        {!solved && issues.length === 0 && <p className="empty-state">{language === 'es' ? 'Envía una petición para ver la respuesta de la API.' : 'Send a request to see the API response.'}</p>}
        {!solved && issues.length > 0 && <div className="feedback feedback--error" role="alert"><strong>400 Bad Request</strong><p>{language === 'es' ? 'La petición todavía no cumple el objetivo:' : 'The request does not meet the objective yet:'}</p><ul>{issues.map((issue, index) => <li key={`${issue.code}-${index}`}>{issueText(issue, language)}</li>)}</ul></div>}
        {solved && <div className={`feedback ${mission.successResponse.status >= 400 ? 'feedback--expected-error' : 'feedback--success'}`} role="status"><strong>{mission.successResponse.status} {mission.successResponse.statusText}</strong>{mission.successResponse.headers && <pre>{Object.entries(mission.successResponse.headers).map(([key,value]) => `${key}: ${value}`).join('\n')}</pre>}{mission.successResponse.body !== undefined && <pre>{JSON.stringify(mission.successResponse.body, null, 2)}</pre>}<h3>{language === 'es' ? 'Por qué funciona' : 'Why it works'}</h3><p>{mission.explanation[language]}</p><p className="xp-earned">+{xp} XP</p></div>}
      </div></section>
    </div>
    {!solved && mission.hints.length > 0 && <section className="hint-panel"><div><h2>{language === 'es' ? 'Pistas' : 'Hints'}</h2>{mission.hints.slice(0, hintsUsed).map((hint, index) => <p key={index}><strong>{index + 1}.</strong> {hint[language]}</p>)}</div>{hintsUsed < mission.hints.length && <button className="button" type="button" onClick={() => setHintsUsed((count) => count + 1)}>{language === 'es' ? 'Mostrar una pista' : 'Show a hint'}</button>}</section>}
  </>
}
