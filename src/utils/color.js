let toHex = function (color) {
  let colorString = color.toString(16)
  return colorString.length === 1 ? `0${colorString}` : colorString
}

let removeHash = function (colorString) {
  return colorString.replace('#', '')
}

export let blendColor = function (color1, color2, ratio) {
  color1 = removeHash(color1)
  color2 = removeHash(color2)

  let r = Math.ceil(
    parseInt(color2.substring(0, 2), 16) * ratio +
    parseInt(color1.substring(0, 2), 16) * (1 - ratio)
  )
  let g = Math.ceil(
    parseInt(color2.substring(2, 4), 16) * ratio +
    parseInt(color1.substring(2, 4), 16) * (1 - ratio)
  )
  let b = Math.ceil(
    parseInt(color2.substring(4, 6), 16) * ratio +
    parseInt(color1.substring(4, 6), 16) * (1 - ratio)
  )

  return '#' + toHex(r) + toHex(g) + toHex(b)
}
