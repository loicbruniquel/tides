/**
 * Geometry for the tide graph, ported from the legacy `src/utils/plot.js`.
 *
 * Everything is normalised into a 0–100 percentage space so the SVG can use a fixed
 * viewBox and stretch to any container size. See CLAUDE.md for why the y axis is
 * inverted (HAT → 0, LAT → 100).
 */

const SMOOTH_RATIO = 0.2

export interface PlotPoint {
  x: number
  y: number
}

interface LineProps {
  length: number
  angle: number
}

/** Length and angle (radians) of the line between two points. */
function line(pointA: PlotPoint, pointB: PlotPoint): LineProps {
  const lengthX = pointB.x - pointA.x
  const lengthY = pointB.y - pointA.y
  return {
    length: Math.sqrt(lengthX ** 2 + lengthY ** 2),
    angle: Math.atan2(lengthY, lengthX),
  }
}

/**
 * A bezier control point for `current`, angled along the line joining its neighbours.
 * `reverse` produces the end control point rather than the start one.
 */
function controlPoint(
  current: PlotPoint,
  previous: PlotPoint | undefined,
  next: PlotPoint | undefined,
  reverse = false,
): PlotPoint {
  const prev = previous ?? current
  const nxt = next ?? current

  const referenceLine = line(prev, nxt)
  const angle = referenceLine.angle + (reverse ? Math.PI : 0)
  const length = referenceLine.length * SMOOTH_RATIO

  return {
    x: current.x + Math.cos(angle) * length,
    y: current.y + Math.sin(angle) * length,
  }
}

function bezierCommand(point: PlotPoint, index: number, allPoints: PlotPoint[]): string {
  const oppositePoint = allPoints[index - 2]
  const previousPoint = allPoints[index - 1]
  const nextPoint = allPoints[index + 1]

  const startCP = controlPoint(previousPoint ?? point, oppositePoint, point)
  const endCP = controlPoint(point, previousPoint, nextPoint, true)

  return `C ${startCP.x},${startCP.y} ${endCP.x},${endCP.y} ${point.x},${point.y}`
}

/** Where `value` sits between `minValue` and `maxValue`, as a 0–100 percentage. */
export function getPercentValue(value: number, minValue: number, maxValue: number): number {
  const span = maxValue - minValue
  if (span === 0) return 0
  const offset = value - minValue
  return Number.parseFloat(((offset / span) * 100).toFixed(2))
}

/** The inverse of {@link getPercentValue}. */
export function getAbsoluteValue(
  percentValue: number,
  minValue: number,
  maxValue: number,
): number {
  const span = maxValue - minValue
  return minValue + (span * percentValue) / 100
}

/** Rescales points into the 0–100 space, preserving any extra fields on each point. */
export function convertedValues<T extends PlotPoint>(
  points: T[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): T[] {
  return points.map((point) => ({
    ...point,
    x: getPercentValue(point.x, minX, maxX),
    y: getPercentValue(point.y, minY, maxY),
  }))
}

/** A smoothed cubic-bezier `d` attribute through every point. */
export function svgPath(points: PlotPoint[]): string {
  return points.reduce((pathString, point, index, allPoints) => {
    if (index === 0) return `M ${point.x},${point.y}`
    return `${pathString} ${bezierCommand(point, index, allPoints)}`
  }, '')
}

/**
 * Linearly interpolates the curve's y at `targetX`, so the hover readout tracks the
 * line between samples rather than snapping to them.
 */
export function yForX(points: PlotPoint[], targetX: number): number {
  if (points.length === 0) return 0

  const afterIndex = points.findIndex((point) => point.x > targetX)

  // Past the last sample — clamp to it rather than extrapolating.
  if (afterIndex === -1) return points[points.length - 1]!.y

  const after = points[afterIndex]!
  const before = points[afterIndex - 1]

  if (!before) return after.y

  const spanX = after.x - before.x
  if (spanX === 0) return after.y

  const ratioX = (targetX - before.x) / spanX
  return before.y + (after.y - before.y) * ratioX
}
