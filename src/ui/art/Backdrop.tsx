/**
 * Decorative background of the whole game: the server room of `server-room.ts` with
 * data packets running along the ceiling. It sits behind the page and is hidden from
 * screen readers. Its colours and animations are in `styles/backdrop.css`.
 */

import { buildServerRoom, SCENE_HEIGHT, SCENE_WIDTH } from './server-room'

/** The scene never changes, so it is built once for the whole session. */
const scene = buildServerRoom()

/** Horizontal rows of the moving packets, with the classes that set their speed. */
const PACKETS = [
  { y: 8, className: 'backdrop__packet backdrop__packet--slow' },
  { y: 8, className: 'backdrop__packet backdrop__packet--late' },
  { y: 15, className: 'backdrop__packet backdrop__packet--fast' },
]

interface BackdropProps {
  /** `true` on the initial menu, where the scene is the protagonist. Other screens dim it. */
  prominent: boolean
}

/** Renders the background scene. */
export function Backdrop({ prominent }: BackdropProps) {
  return (
    <div className={`backdrop${prominent ? ' backdrop--prominent' : ''}`} aria-hidden="true">
      <svg
        viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
        preserveAspectRatio="xMidYMin slice"
        shapeRendering="crispEdges"
        focusable="false"
      >
        <path className="backdrop__back-rack" d={scene.backRacks} />
        <path className="backdrop__back-plate" d={scene.backPlates} />
        <path className="backdrop__tray" d={scene.trays} />
        <path className="backdrop__floor" d={scene.floorLines} />
        <path className="backdrop__front-rack" d={scene.frontRacks} />
        <path className="backdrop__front-plate" d={scene.frontPlates} />
        <path className="backdrop__light" d={scene.steadyLights} />
        {scene.blinkingLights.map((lights, index) => (
          <path className={`backdrop__light backdrop__light--blink-${index + 1}`} d={lights} key={index} />
        ))}
        {PACKETS.map(({ y, className }) => (
          <rect className={className} x="-8" y={y} width="6" height="2" key={className} />
        ))}
      </svg>
    </div>
  )
}
