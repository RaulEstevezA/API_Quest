/**
 * Generator of the background scene: two rows of server racks in a dark room.
 *
 * Everything of one colour is joined into a single SVG path, which keeps the page
 * light: the scene has hundreds of rectangles but only a handful of elements. Only
 * the three groups of blinking lights are animated. Random choices use a fixed seed,
 * so the room looks the same on every visit and on every render.
 */

/** Width and height of the scene, in art pixels. */
export const SCENE_WIDTH = 480
export const SCENE_HEIGHT = 200

const FLOOR_Y = 172
const RACK_WIDTH = 30
const UNIT_HEIGHT = 8

/** Path data of each layer of the scene, from the back to the front. */
export interface ServerRoomScene {
  backRacks: string
  backPlates: string
  frontRacks: string
  frontPlates: string
  floorLines: string
  trays: string
  /** Lights that never change. */
  steadyLights: string
  /** Lights that blink, in groups that animate with different rhythms. */
  blinkingLights: [string, string, string]
}

/** Builds a small seeded generator of numbers between 0 and 1 (mulberry32). */
function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

function rect(x: number, y: number, width: number, height: number): string {
  return `M${x} ${y}h${width}v${height}h-${width}z`
}

/**
 * Builds the scene.
 *
 * @returns The path data of every layer. The result is the same on every call.
 */
export function buildServerRoom(): ServerRoomScene {
  const random = createRandom(2026)
  const scene: ServerRoomScene = {
    backRacks: '',
    backPlates: '',
    frontRacks: '',
    frontPlates: '',
    floorLines: '',
    trays: '',
    steadyLights: '',
    blinkingLights: ['', '', ''],
  }

  /** Draws the lights of a server unit. Most of them are steady, so the room does not feel restless. */
  const addLights = (x: number, y: number) => {
    const count = 2 + Math.floor(random() * 4)
    for (let light = 0; light < count; light += 1) {
      const lightRect = rect(x + light * 3, y, 2, 2)
      const kind = random()
      if (kind < 0.2) scene.blinkingLights[Math.floor(random() * 3)] += lightRect
      else if (kind < 0.7) scene.steadyLights += lightRect
    }
  }

  // Back row: smaller and dimmer, which suggests depth without any perspective maths.
  for (let x = -6; x < SCENE_WIDTH; x += 24) {
    const top = 58 + Math.floor(random() * 3) * 2
    scene.backRacks += rect(x, top, 21, FLOOR_Y - 12 - top)
    for (let y = top + 3; y < FLOOR_Y - 18; y += 6) {
      scene.backPlates += rect(x + 2, y, 17, 4)
    }
  }

  // Front row: the aisle in the middle leaves room for the title of the initial menu.
  for (let x = 2; x < SCENE_WIDTH; x += RACK_WIDTH + 4) {
    if (x > 150 && x < 310) continue
    const top = 26 + Math.floor(random() * 3) * 4
    scene.frontRacks += rect(x, top, RACK_WIDTH, FLOOR_Y - top)
    for (let y = top + 4; y < FLOOR_Y - UNIT_HEIGHT; y += UNIT_HEIGHT) {
      scene.frontPlates += rect(x + 3, y, RACK_WIDTH - 6, UNIT_HEIGHT - 2)
      addLights(x + 5, y + 2)
    }
  }

  // Floor tiles: the rows get closer together towards the horizon.
  for (let step = 0, y = FLOOR_Y; y < SCENE_HEIGHT; step += 1, y += 3 + step * 2) {
    scene.floorLines += rect(0, y, SCENE_WIDTH, 1)
  }

  // Cable trays along the ceiling, where the data packets travel.
  scene.trays = rect(0, 8, SCENE_WIDTH, 2) + rect(0, 16, SCENE_WIDTH, 1)

  return scene
}
