import { describe, expect, it } from 'vitest'

import { clampTimeout, MAX_TIMER_MS } from './timers'

const DAY_MS = 24 * 60 * 60 * 1000

describe('clampTimeout', () => {
  it('leaves representable durations alone', () => {
    expect(clampTimeout(6 * 60 * 60 * 1000)).toBe(6 * 60 * 60 * 1000)
    expect(clampTimeout(0)).toBe(0)
  })

  it('caps durations a 32-bit delay cannot hold', () => {
    // 30 days is the case that broke the offline cache: TanStack Query scheduled
    // garbage collection with it, the delay wrapped negative, and every query was
    // evicted a tick after losing its last observer.
    expect(30 * DAY_MS).toBeGreaterThan(MAX_TIMER_MS)
    expect(clampTimeout(30 * DAY_MS)).toBe(MAX_TIMER_MS)
  })

  it('refuses negative and non-finite durations', () => {
    expect(clampTimeout(-1)).toBe(0)
    expect(clampTimeout(Infinity)).toBe(MAX_TIMER_MS)
    expect(clampTimeout(Number.NaN)).toBe(MAX_TIMER_MS)
  })
})
