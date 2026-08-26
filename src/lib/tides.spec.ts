import { describe, expect, it } from 'vitest'

import type { TideDay } from '@/types'

import { heightAt, isRising, nextExtreme } from './tides'

/* A real slice of https://tidesproxy.mauvaisgout.net/tides/33.88,-7.04/2026-08-27.
   Heights are metres relative to MSL, so roughly half of them are negative — the case
   the graph and these helpers both have to survive. */
const day: TideDay = {
  lat: 34,
  lon: -7,
  datums: [
    { name: 'HAT', height: 1.921 },
    { name: 'LAT', height: -1.921 },
    { name: 'MSL', height: 0 },
  ],
  heights: [
    { dt: 1_787_803_200, date: '2026-08-27T04:00+0000', height: 0.258 },
    { dt: 1_787_805_000, date: '2026-08-27T04:30+0000', height: -0.024 },
    { dt: 1_787_806_800, date: '2026-08-27T05:00+0000', height: -0.306 },
    { dt: 1_787_808_600, date: '2026-08-27T05:30+0000', height: -0.567 },
  ],
  extremes: [
    { dt: 1_787_815_800, date: '2026-08-27T07:30+0000', height: -1.097, type: 'Low' },
    { dt: 1_787_839_200, date: '2026-08-27T14:00+0000', height: 1.316, type: 'High' },
  ],
}

describe('nextExtreme', () => {
  it('finds the next turn of the tide', () => {
    expect(nextExtreme(day, 1_787_803_200)?.type).toBe('Low')
    expect(nextExtreme(day, 1_787_820_000)?.type).toBe('High')
  })

  it('returns nothing once the day has no turns left', () => {
    expect(nextExtreme(day, 1_787_900_000)).toBeUndefined()
  })

  it('is safe on missing data', () => {
    expect(nextExtreme(undefined, 0)).toBeUndefined()
  })
})

describe('heightAt', () => {
  it('interpolates between samples, including through zero', () => {
    // Midway between +0.258 and -0.024.
    expect(heightAt(day, 1_787_804_100)).toBeCloseTo(0.117, 3)
  })

  it('keeps negative levels negative', () => {
    expect(heightAt(day, 1_787_807_700)).toBeCloseTo(-0.4365, 3)
  })

  it('returns undefined past the end of the day rather than extrapolating', () => {
    expect(heightAt(day, 1_787_900_000)).toBeUndefined()
  })

  it('is safe on missing data', () => {
    expect(heightAt(undefined, 0)).toBeUndefined()
  })
})

describe('isRising', () => {
  it('is falling while the next extreme is a low', () => {
    expect(isRising(day, 1_787_803_200)).toBe(false)
  })

  it('is rising while the next extreme is a high', () => {
    expect(isRising(day, 1_787_820_000)).toBe(true)
  })
})
