/**
 * Catalogue of interface texts, grouped by screen.
 *
 * Interface texts use the same `LocalizedText` shape as the missions, so every
 * visible text in the game is read in the same way: `text[language]`. To add a
 * text, declare it here in both languages. Texts with data are functions.
 */

import type { EvaluationIssue, EvaluationIssueCode } from '../core/evaluate-request'
import type { LocalizedText } from '../core/missions'
import { t } from './helpers'

/** A numbered step of the onboarding dialog, or one of its information cards. */
interface TitledText {
  title: LocalizedText
  description: LocalizedText
}

/** Explanation of each validation problem. `Record` makes the compiler require every code. */
export const issueText: Record<EvaluationIssueCode, (issue: EvaluationIssue) => LocalizedText> = {
  method: ({ expected, received }) => t(`Use ${expected}, not ${received}.`, `Usa ${expected}, no ${received}.`),
  path: ({ expected }) => t(`The endpoint should be ${expected}.`, `El endpoint debe ser ${expected}.`),
  'query-missing': ({ key }) => t(`Check the query parameter “${key}”.`, `Revisa el parámetro query «${key}».`),
  'query-unexpected': ({ key }) =>
    t(`The query parameter “${key}” is not needed.`, `No necesitas el parámetro query «${key}».`),
  'header-missing': ({ key }) => t(`Check the “${key}” header.`, `Revisa el header «${key}».`),
  'header-unexpected': ({ key }) => t(`The “${key}” header is not needed.`, `No necesitas el header «${key}».`),
  'body-missing': () => t('Add the required JSON body.', 'Añade el cuerpo JSON requerido.'),
  'body-invalid-json': () =>
    t(
      'The body is not valid JSON. Check quotes, commas, and values.',
      'El cuerpo no es JSON válido. Revisa comillas, comas y valores.',
    ),
  'body-mismatch': () =>
    t(
      'The JSON is valid, but its fields or values do not match the task.',
      'El JSON es válido, pero sus campos o valores no coinciden con la tarea.',
    ),
}

/** Every other interface text, by screen. */
export const uiText = {
  document: {
    title: t('API Quest - Learn REST APIs', 'API Quest - Aprende APIs REST'),
  },
  header: {
    languageGroup: t('Language', 'Idioma'),
  },
  menu: {
    label: t('Main menu', 'Menú principal'),
    back: t('Menu', 'Menú'),
    continue: t('Continue', 'Continuar'),
    docs: t('Docs', 'Docs'),
    sandbox: t('Sandbox', 'Sandbox'),
    help: t('How to play', 'Cómo jugar'),
    subtitle: t('Learn REST APIs through hands-on challenges', 'Aprende APIs REST mediante retos prácticos'),
    description: t(
      'Build requests, interpret responses, and solve development tasks in a simulated API.',
      'Construye peticiones, interpreta respuestas y resuelve tareas de desarrollo en una API simulada.',
    ),
    missions: t('Missions', 'Misiones'),
    storageUnavailable: t(
      'Progress will last only for this tab because local storage is unavailable.',
      'El progreso durará solo durante esta pestaña porque el almacenamiento local no está disponible.',
    ),
    progressReset: t(
      'Your saved progress could not be restored because it is damaged or belongs to an earlier version of the game, so it has been reset.',
      'No se ha podido recuperar tu progreso guardado porque está dañado o pertenece a una versión anterior del juego, así que se ha reiniciado.',
    ),
    chapters: t('Chapters', 'Capítulos'),
    chaptersHint: t(
      'Complete a chapter to unlock the next one.',
      'Completa un capítulo para desbloquear el siguiente.',
    ),
    resetProgress: t('Reset progress', 'Reiniciar progreso'),
    resetConfirmation: t('Reset all progress and XP?', '¿Reiniciar todo el progreso y el XP?'),
    games: t('Games', 'Juegos'),
    locked: t('Locked', 'Bloqueado'),
    pending: t('Pending', 'Pendiente'),
    chapterInPreparation: t(
      'This chapter’s missions are being prepared.',
      'Las misiones de este capítulo están en preparación.',
    ),
    achievements: t('Achievements', 'Logros'),
    achievementsHint: t(
      'Milestones tied to your learning progress.',
      'Logros vinculados a tu progreso de aprendizaje.',
    ),
    earned: t('Earned', 'Conseguido'),
  },
  mission: {
    backToChapters: t('Chapters', 'Capítulos'),
    attempts: t('Attempts', 'Intentos'),
    position: (chapter: number, order: number) =>
      t(`Chapter ${chapter} · Mission ${order}`, `Capítulo ${chapter} · Misión ${order}`),
    objective: t('Objective', 'Objetivo'),
    noResponse: t('Send a request to see the API response.', 'Envía una petición para ver la respuesta de la API.'),
    notSolved: t('The request does not meet the objective yet:', 'La petición todavía no cumple el objetivo:'),
    whyItWorks: t('Why it works', 'Por qué funciona'),
    next: t('Next mission', 'Siguiente misión'),
    hints: t('Hints', 'Pistas'),
    showHint: t('Show a hint', 'Mostrar una pista'),
  },
  request: {
    title: t('Request Builder', 'Constructor de petición'),
    method: t('Method', 'Método'),
    queryParameters: t('Query parameters', 'Parámetros query'),
    headers: t('Headers', 'Headers'),
    jsonBody: t('JSON body', 'Cuerpo JSON'),
    key: t('Key', 'Clave'),
    value: t('Value', 'Valor'),
    rowKey: (group: string, row: number) => t(`${group} key ${row}`, `${group} clave ${row}`),
    rowValue: (group: string, row: number) => t(`${group} value ${row}`, `${group} valor ${row}`),
    addRow: t('Add row', 'Añadir fila'),
    removeRow: t('Remove row', 'Eliminar fila'),
    send: t('Send Request', 'Enviar petición'),
    solved: t('Solved', 'Resuelto'),
  },
  response: {
    title: t('Response', 'Respuesta'),
    client: t('Client', 'Cliente'),
  },
  sandbox: {
    eyebrow: t('Free practice', 'Práctica libre'),
    description: t(
      'Experiment with the fictional API. Changes are saved in this browser.',
      'Experimenta con la API ficticia. Los cambios se guardan en este navegador.',
    ),
    resetData: t('Reset data', 'Restablecer datos'),
    resetConfirmation: t('Reset all Sandbox data?', '¿Restablecer todos los datos del Sandbox?'),
    noResponse: t('Send a request to begin.', 'Envía una petición para empezar.'),
  },
  docs: {
    eyebrow: t('API reference', 'Referencia de la API'),
    title: t('API Documentation', 'Documentación de API'),
    subtitle: t(
      'Consult endpoints, parameters, and authentication while solving missions.',
      'Consulta endpoints, parámetros y autenticación mientras resuelves misiones.',
    ),
    queryParameters: t('Query parameters', 'Parámetros query'),
    resource: t('Resource', 'Recurso'),
    parameters: t('Parameters', 'Parámetros'),
    authentication: t('Authentication', 'Autenticación'),
    authenticationHint: t('Protected endpoints expect this header:', 'Los endpoints protegidos esperan este header:'),
  },
  modal: {
    close: t('Close', 'Cerrar'),
  },
  onboarding: {
    eyebrow: t('Before you start', 'Antes de empezar'),
    title: t('How API Quest works', 'Cómo funciona API Quest'),
    intro: t(
      'You will learn REST APIs by solving tasks similar to those handled by a development team. No previous experience is required: the first missions guide you step by step.',
      'Aprenderás APIs REST resolviendo tareas similares a las que recibe un equipo de desarrollo. No necesitas experiencia previa: las primeras misiones te guían paso a paso.',
    ),
    steps: [
      {
        title: t('Read the mission', 'Lee la misión'),
        description: t(
          'The objective tells you what information to retrieve or what change to make.',
          'El objetivo indica qué información debes obtener o qué cambio debes realizar.',
        ),
      },
      {
        title: t('Build the request', 'Construye la petición'),
        description: t(
          'Choose the HTTP method and complete the endpoint. Later you will add query parameters, headers, and JSON.',
          'Elige el método HTTP y completa el endpoint. Más adelante añadirás query parameters, headers y JSON.',
        ),
      },
      {
        title: t('Send and review the response', 'Envía y revisa la respuesta'),
        description: t(
          'Select “Send Request.” If something is wrong, you will receive specific feedback and can try again.',
          'Pulsa «Enviar petición». Si hay un error, recibirás una explicación concreta y podrás volver a intentarlo.',
        ),
      },
      {
        title: t('Learn from the result', 'Aprende del resultado'),
        description: t(
          'After solving it, you will see the API response, an explanation, and the XP earned.',
          'Al resolverla verás la respuesta de la API, una explicación y el XP conseguido.',
        ),
      },
    ] satisfies TitledText[],
    locations: [
      {
        title: t('Docs', 'Docs'),
        description: t(
          'Check available endpoints and parameters when a mission does not provide every detail.',
          'Consulta los endpoints y parámetros disponibles cuando una misión no te dé toda la información.',
        ),
      },
      {
        title: t('Sandbox', 'Sandbox'),
        description: t(
          'Practise freely without affecting missions. You can create, read, update, and delete resources.',
          'Practica libremente sin afectar a las misiones. Puedes crear, consultar, modificar y eliminar recursos.',
        ),
      },
      {
        title: t('Hints and progress', 'Pistas y progreso'),
        description: t(
          'Use hints if you get stuck. Progress is stored only in this browser and can be reset at any time.',
          'Usa pistas si te bloqueas. El progreso se guarda solo en este navegador y puedes reiniciarlo cuando quieras.',
        ),
      },
    ] satisfies TitledText[],
    tip: t(
      'Tip: start with “Open the catalogue.” You only need to choose GET and enter /products.',
      'Consejo: empieza por «Abre el catálogo». Solo necesitas elegir GET y escribir /products.',
    ),
    explore: t('Explore first', 'Explorar primero'),
    start: t('Start first mission', 'Empezar primera misión'),
  },
}
