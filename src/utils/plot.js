let getPercentCoord = function (dt, startValue, endValue) {
  let span = endValue - startValue
  let offset = dt - startValue
  return (offset / span * 100).toFixed(2)
}

export let svgPath = function (heights, maxHeight, minHeight) {
  let startValueX = heights[0].x
  let endValueX = heights[heights.length - 1].x

  let startY = getPercentCoord(heights[0].y, minHeight, maxHeight)

  let index = 0

  let coords = heights.map(height => {
    let x = getPercentCoord(height.x, startValueX, endValueX)
    let y = getPercentCoord(height.y, minHeight, maxHeight)
    let str = null
    if (index === 0) {
      str = `L${x} ${y}`
    } else if (index === 1) {
      str = `Q${x} ${y}`
    } else if (index === 2) {
      str = `${x} ${y}`
    } else {
      throw new Error('Index must be less than 3')
    }
    index++
    if (index >= 3) {
      index = 0
    }
    return str
  })
  let pathString = coords.join(' ')
  console.log(pathString)
  return `M0 ${startY} ${pathString}`
  // return 'M0 100 Q 50 0 100 100'
}
