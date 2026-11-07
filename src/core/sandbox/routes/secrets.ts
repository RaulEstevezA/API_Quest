/**
 * Hidden routes of the Sandbox. They are deliberately missing from the Docs screen and
 * from the README, so that players find them by exploring.
 *
 * The main one is a trail that practises reading responses: `/users/42` leads to
 * `/users/0`, which leads to `/server-room`, where turning the lights off earns a secret
 * achievement. The clues are game content rather than API data, so they are translated.
 * To add a secret, write its route and add it to `secretRoutes`.
 */

import { NIGHT_SHIFT_ACHIEVEMENT } from '../../achievements'
import type { LocalizedText } from '../../missions'
import { jsonBody, methodNotAllowed, type RoomLights, type Route } from '../state'
import { resourcesRoute } from './resources'

const LIGHT_STATES: readonly RoomLights[] = ['on', 'off', 'red']

const clues = {
  firstClue: {
    en: 'Someone still works in /users/0',
    es: 'Alguien sigue trabajando en /users/0',
  },
  nightShiftName: { en: 'The night shift', es: 'El turno de noche' },
  nightShiftStatus: { en: 'never logged out', es: 'nunca cerró sesión' },
  secondClue: {
    en: 'They left the lights on. See /server-room',
    es: 'Se dejaron las luces encendidas. Mira /server-room',
  },
  roomHint: { en: 'Try changing that.', es: 'Prueba a cambiarlo.' },
  lightsOut: { en: 'Lights out. Shift over.', es: 'Luces apagadas. Fin del turno.' },
  production: { en: 'Good luck explaining this.', es: 'Suerte explicando esto.' },
  rollback: { en: 'Backup restored. Nobody saw anything.', es: 'Copia restaurada. Nadie ha visto nada.' },
} satisfies Record<string, LocalizedText>

/** Adds the first clue to user 42, when that record still exists. */
const firstClueRoute: Route = (context) => {
  if (context.parts.join('/') !== 'users/42' || context.request.method !== 'GET') return null
  const result = resourcesRoute(context)
  if (result?.response.status !== 200) return result
  const body = { ...(result.response.body as object), note: clues.firstClue[context.language] }
  return { ...result, response: { ...result.response, body } }
}

/** The previous night shift. It is not in the collection, so listing the users does not reveal it. */
const nightShiftRoute: Route = ({ state, request, parts, language }) => {
  if (parts.join('/') !== 'users/0' || request.method !== 'GET') return null
  return {
    state,
    response: {
      status: 200,
      statusText: 'OK',
      body: {
        id: 0,
        name: clues.nightShiftName[language],
        status: clues.nightShiftStatus[language],
        note: clues.secondClue[language],
      },
    },
  }
}

/** The lights of the room, which the background of the game shows. */
const serverRoomRoute: Route = ({ state, request, parts, language }) => {
  if (parts.join('/') !== 'server-room') return null
  const lights = state.lights ?? 'on'

  if (request.method === 'GET') {
    return { state, response: { status: 200, statusText: 'OK', body: { lights, hint: clues.roomHint[language] } } }
  }
  if (request.method !== 'PATCH') return { state, response: methodNotAllowed() }

  const next = jsonBody(request)?.lights
  if (!LIGHT_STATES.includes(next as RoomLights)) {
    return {
      state,
      response: { status: 400, statusText: 'Bad Request', body: { error: 'lights must be on, off or red' } },
    }
  }
  const nextLights = next as RoomLights
  return {
    state: { ...state, lights: nextLights },
    response: {
      status: 200,
      statusText: 'OK',
      body: nextLights === 'off' ? { lights: nextLights, message: clues.lightsOut[language] } : { lights: nextLights },
    },
    earnedAchievement: nextLights === 'off' ? NIGHT_SHIFT_ACHIEVEMENT : undefined,
  }
}

/** A real HTTP status code that was born as a joke, for any method. */
const coffeeRoute: Route = ({ state, parts }) => {
  if (parts.join('/') !== 'coffee') return null
  return { state, response: { status: 418, statusText: "I'm a teapot", body: { error: 'This API only serves tea' } } }
}

/** Pretends to destroy production for a few seconds. Nothing in the state changes. */
const productionRoute: Route = ({ state, request, parts, language }) => {
  if (parts.join('/') !== 'production' || request.method !== 'DELETE') return null
  return {
    state,
    response: {
      status: 200,
      statusText: 'OK',
      body: { status: 'deleted', message: clues.production[language] },
    },
    alarmFollowUp: {
      status: 200,
      statusText: 'OK',
      body: { status: 'restored', rollback: 'completed', message: clues.rollback[language] },
    },
  }
}

/** Every hidden route. */
export const secretRoutes: Route[] = [firstClueRoute, nightShiftRoute, serverRoomRoute, coffeeRoute, productionRoute]
