/**
 * Screens of the game (state machine).
 *
 * The application is always on exactly one `Screen`. A discriminated union makes
 * invalid combinations impossible, such as a mission open on the Docs screen. To add
 * a screen, add it to the union and the compiler will point to the `switch` in `App`.
 */

/** Screens reachable from the game navigation. */
export type MenuScreen = 'missions' | 'docs' | 'sandbox'

/** The screen being shown. */
export type Screen = { name: MenuScreen } | { name: 'mission'; missionId: string }

/** Screen shown when the game starts. It is the initial menu, which must show the website header. */
export const INITIAL_SCREEN: Screen = { name: 'missions' }

/** Mission opened by the onboarding shortcut. */
export const FIRST_MISSION_ID = 'first-request-1'
