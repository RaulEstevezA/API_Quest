/**
 * Renders drawings written as text grids, one character per pixel. The art of the game
 * is plain code instead of image files, so it follows the theme colours of each chapter,
 * stays sharp at any size and adds almost nothing to the download.
 *
 * To add a drawing, add a grid to `emblems.ts`. To add a colour, add it to `PIXEL_COLORS`.
 */

/** Meaning of each grid character. A dot, or any character not listed here, is transparent. */
const PIXEL_COLORS: Record<string, { fill: string; opacity?: number }> = {
  a: { fill: 'var(--chapter-accent)' },
  b: { fill: 'var(--chapter-accent)', opacity: 0.35 },
  w: { fill: 'var(--text)' },
  g: { fill: 'var(--success)' },
  y: { fill: 'var(--warning)' },
  r: { fill: 'var(--danger)' },
}

/**
 * Converts one colour of a grid into SVG path data, joining adjacent pixels of a row
 * so that the path has one rectangle per run instead of one per pixel.
 *
 * @param rows Rows of the drawing.
 * @param character Character of the colour to convert.
 * @returns Path data, empty when the colour is not used.
 */
export function gridToPath(rows: readonly string[], character: string): string {
  return rows
    .flatMap((row, y) =>
      [...row.matchAll(new RegExp(`${character}+`, 'g'))].map(
        (run) => `M${run.index} ${y}h${run[0].length}v1h-${run[0].length}z`,
      ),
    )
    .join('')
}

interface PixelArtProps {
  rows: readonly string[]
  className?: string
}

/** Renders a grid as a decorative image, hidden from screen readers. */
export function PixelArt({ rows, className }: PixelArtProps) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {Object.entries(PIXEL_COLORS).map(([character, { fill, opacity }]) => (
        <path key={character} d={gridToPath(rows, character)} fill={fill} opacity={opacity} />
      ))}
    </svg>
  )
}
