/**
 * Screens of the game (state machine).
 *
 * The application is always on exactly one `Screen`. A discriminated union makes
 * invalid combinations impossible, such as a mission open on the Docs screen. To add
 * a screen, add it to the union and the compiler will point to the `switch` in `App`.
 */

/** Screens reachable from the main menu. */
export type MenuDestination = 'missions' | 'docs' | 'sandbox' | 'achievements'

/** The screen being shown. */
export type Screen = { name: 'menu' } | { name: MenuDestination } | { name: 'mission'; missionId: string }

/** Screen shown when the game starts. It must show the website header. */
export const INITIAL_SCREEN: Screen = { name: 'menu' }

/** Mission opened by the onboarding shortcut. */
export const FIRST_MISSION_ID = 'first-request-1'
