const SMOOTH_RATIO = 0.2

/**
 * Returns a percentage of the value in reference to the min and max values
 * @param {float} value
 * @param {float} minValue
 * @param {float} maxValue
 */
export let getPercentValue = function (value, minValue, maxValue) {
  let span = maxValue - minValue
  let offset = value - minValue
  return parseFloat(((offset / span) * 100).toFixed(2))
}

/**
 * Returns the properties (length and angle in radians) of the line between the two points
 * @param {object} pointA
 * @param {object} pointB
 */
let line = function (pointA, pointB) {
  const lengthX = pointB.x - pointA.x
  const lengthY = pointB.y - pointA.y
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

/**
 * Returns a control point coordinates
 * @param {object} current The reference point (source of the control point)
 * @param {object} previous Point before the reference point
 * @param {object} next Point after the reference point
 * @param {bool} reverse True if it's the end control point
 */
let controlPoint = function (current, previous, next, reverse) {
  // if no previous or next, use current
  previous = previous || current
  next = next || current

  // getting info about line opposite to point (length and angle)
  const referenceLine = line(previous, next)

  // if end control point, reverse angle by adding PI
  const angle = referenceLine.angle + (reverse ? Math.PI : 0)

  // ajusting length of control point with smooth ratio
  const length = referenceLine.length * SMOOTH_RATIO

  // calculating x,y from angle and lenth, relative to current point
  const x = current.x + Math.cos(angle) * length
  const y = current.y + Math.sin(angle) * length

  return { x, y }
}

/**
 * Returns a bezier command string for the point
 * @param {object} point
 * @param {number} index
 * @param {array} allPoints
 */
let bezierCommand = function (point, index, allPoints) {
  let oppositePoint = allPoints[index - 2]
  let previousPoint = allPoints[index - 1]
  let nextPoint = allPoints[index + 1]

  // start control point, using line between 2 previous point as reference
  const startCP = controlPoint(previousPoint, oppositePoint, point)

  // end control point, using line between previous and next point as reference
  const endCP = controlPoint(point, previousPoint, nextPoint, true)

  return `C ${startCP.x},${startCP.y} ${endCP.x},${endCP.y} ${point.x},${point.y}`
}

/**
 * Returns a smoothed svg path string
 * @param {object} points Each point is an object with x and y coordinate
 * @param {float} minY
 * @param {float} maxY
 * @returns {string}
 */
export let svgPath = function (points, minX, maxX, minY, maxY) {
  return points.map(point => {
    return {
      x: getPercentValue(point.x, minX, maxX),
      y: getPercentValue(point.y, minY, maxY)
    }
  }).reduce((pathString, point, index, allPoints) => {
    if (index === 0) {
      // first point is move command
      return `M ${point.x},${point.y}`
    } else {
      // adding bezier command for each point
      return `${pathString} ${bezierCommand(point, index, allPoints)}`
    }
  }, '')
}
