/**
 * Connects the simulated API of the core to React state. It lives above the screens
 * because the Sandbox changes things outside itself: the lights of the room, which the
 * background shows on every screen, and an achievement.
 */

import { useEffect, useState } from 'react'
import type { ApiRequest, ApiResponse } from '../core/http'
import { runSandboxRequest } from '../core/sandbox/router'
import { createSandboxState, loadSandbox, saveSandbox } from '../core/sandbox/state'
import type { StorageAdapter } from '../core/storage'
import type { Language } from './i18n'

/** Duration of the alarm after deleting production. Long enough to believe it for a moment. */
const ALARM_DURATION_MS = 4000

/**
 * Provides the Sandbox data and the actions that change it.
 *
 * @param storage Store that holds the data.
 * @param onAchievement Called with the identifier of an achievement earned by a request.
 * @returns The state to show and the actions of the Sandbox screen.
 */
export function useSandbox(storage: StorageAdapter, onAchievement: (id: string) => void) {
  const [initial] = useState(() => loadSandbox(storage))
  const [state, setState] = useState(initial.state)
  const [dataWasReset, setDataWasReset] = useState(initial.status === 'reset')
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [sendCount, setSendCount] = useState(0)
  const [alarmFollowUp, setAlarmFollowUp] = useState<ApiResponse | null>(null)

  useEffect(() => {
    saveSandbox(storage, state)
  }, [storage, state])

  // When the alarm ends, the frightening response gives way to the rollback.
  useEffect(() => {
    if (!alarmFollowUp) return
    const timer = window.setTimeout(() => {
      setResponse(alarmFollowUp)
      setAlarmFollowUp(null)
    }, ALARM_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [alarmFollowUp])

  return {
    lights: state.lights ?? 'on',
    alarm: alarmFollowUp !== null,
    dataWasReset,
    response,
    sendCount,
    send: (request: ApiRequest, language: Language) => {
      const result = runSandboxRequest(state, request, language)
      setState(result.state)
      setResponse(result.response)
      setSendCount((count) => count + 1)
      setAlarmFollowUp(result.alarmFollowUp ?? null)
      if (result.earnedAchievement) onAchievement(result.earnedAchievement)
    },
    reset: () => {
      setState(createSandboxState())
      setResponse(null)
      setAlarmFollowUp(null)
      setDataWasReset(false)
    },
  }
}
