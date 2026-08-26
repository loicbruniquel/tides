import { describe, expect, it } from 'vitest'

import {
  convertedValues,
  getAbsoluteValue,
  getPercentValue,
  svgPath,
  yForX,
  type PlotPoint,
} from './plot'

describe('getPercentValue', () => {
  it('maps a value onto 0–100', () => {
    expect(getPercentValue(5, 0, 10)).toBe(50)
    expect(getPercentValue(0, 0, 10)).toBe(0)
    expect(getPercentValue(10, 0, 10)).toBe(100)
  })

  it('handles negative ranges, which tide heights routinely are', () => {
    expect(getPercentValue(-1.257, -2, 2)).toBeCloseTo(18.58, 2)
  })

  it('returns 0 rather than NaN for a zero span', () => {
    expect(getPercentValue(3, 3, 3)).toBe(0)
  })
})

describe('getAbsoluteValue', () => {
  it('inverts getPercentValue', () => {
    const percent = getPercentValue(1.021, -1.5, 2)
    expect(getAbsoluteValue(percent, -1.5, 2)).toBeCloseTo(1.021, 2)
  })
})

describe('convertedValues', () => {
  // minY is HAT and maxY is LAT — inverted on purpose, because SVG's y grows
  // downward, so high water has to land near y=0. See CLAUDE.md.
  const HAT = 1.921
  const LAT = -1.921

  it('puts high water at the top of the plot', () => {
    const [high] = convertedValues([{ x: 0, y: HAT }], 0, 100, HAT, LAT)
    expect(high!.y).toBe(0)
  })

  it('puts low water at the bottom of the plot', () => {
    const [low] = convertedValues([{ x: 0, y: LAT }], 0, 100, HAT, LAT)
    expect(low!.y).toBe(100)
  })

  it('preserves fields other than x and y', () => {
    const [point] = convertedValues(
      [{ x: 50, y: 0, dt: 1787794560, type: 'High' as const }],
      0,
      100,
      HAT,
      LAT,
    )
    expect(point!.dt).toBe(1787794560)
    expect(point!.type).toBe('High')
  })
})

describe('svgPath', () => {
  it('opens with a move command and then bezier curves', () => {
    const path = svgPath([
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ])
    expect(path.startsWith('M 0,0')).toBe(true)
    expect(path.split('C')).toHaveLength(3)
  })

  it('returns an empty string for no points', () => {
    expect(svgPath([])).toBe('')
  })
})

describe('yForX', () => {
  const points: PlotPoint[] = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 30 },
  ]

  it('interpolates between samples rather than snapping to them', () => {
    expect(yForX(points, 5)).toBe(5)
    expect(yForX(points, 15)).toBe(20)
  })

  it('returns an exact sample when asked for one', () => {
    expect(yForX(points, 10)).toBe(10)
  })

  it('clamps past the last sample instead of extrapolating', () => {
    expect(yForX(points, 40)).toBe(30)
  })

  it('survives an empty series', () => {
    expect(yForX([], 5)).toBe(0)
  })
})
