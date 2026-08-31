import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  addDays,
  daysBetween,
  formatDayLong,
  formatRelative,
  formatTime,
  middayUtc,
  todayInZone,
} from './time'

/* Real values taken from
   https://tidesproxy.mauvaisgout.net/tides/33.88,-7.04/2026-08-27 — a Moroccan
   station, which sits at UTC+1 in August. */
const FIRST_SAMPLE = 1_787_785_200 // 2026-08-26T23:00Z
const FIRST_HIGH = 1_787_794_560 // 2026-08-27T01:36Z

describe('formatTime', () => {
  it('renders in the station timezone, not UTC', () => {
    // The API's day window starts at 23:00 UTC precisely because that is midnight
    // at the station. Rendering it in UTC would show the wrong day entirely.
    expect(formatTime(FIRST_SAMPLE, 'Africa/Casablanca')).toBe('00:00')
    expect(formatTime(FIRST_HIGH, 'Africa/Casablanca')).toBe('02:36')
  })

  it('shows a different time for a viewer in another zone, which is the bug we avoid', () => {
    // Europe/Paris is UTC+2 in August. The legacy app rendered every tide in the
    // device zone, so planning a Moroccan trip from France shifted every high and low.
    expect(formatTime(FIRST_HIGH, 'Europe/Paris')).toBe('03:36')
    expect(formatTime(FIRST_HIGH, 'UTC')).toBe('01:36')
  })

  it('renders midnight as 00:00 rather than 24:00', () => {
    expect(formatTime(FIRST_SAMPLE, 'Africa/Casablanca')).toBe('00:00')
  })
})

describe('addDays', () => {
  it('moves forwards and backwards', () => {
    expect(addDays('2026-08-27', 1)).toBe('2026-08-28')
    expect(addDays('2026-08-27', -1)).toBe('2026-08-26')
    expect(addDays('2026-08-27', 0)).toBe('2026-08-27')
  })

  it('crosses month and year boundaries', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
  })

  it('is unaffected by daylight saving, being pure UTC arithmetic', () => {
    // Europe/Paris springs forward on 2026-03-29; a local-time implementation can
    // land back on the same day here.
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
  })
})

describe('daysBetween', () => {
  it('counts whole days', () => {
    expect(daysBetween('2026-08-27', '2026-08-30')).toBe(3)
    expect(daysBetween('2026-08-30', '2026-08-27')).toBe(-3)
    expect(daysBetween('2026-08-27', '2026-08-27')).toBe(0)
  })
})

describe('todayInZone', () => {
  afterEach(() => vi.useRealTimers())

  it('can report a different date than UTC does', () => {
    vi.useFakeTimers()
    // 23:30 UTC — already tomorrow in Casablanca, still today in New York.
    vi.setSystemTime(new Date('2026-08-26T23:30:00Z'))

    expect(todayInZone('UTC')).toBe('2026-08-26')
    expect(todayInZone('Africa/Casablanca')).toBe('2026-08-27')
    expect(todayInZone('America/New_York')).toBe('2026-08-26')
  })

  // The `at` argument is what lets a component derive the day from the shared clock,
  // so that the day cursor rolls over instead of freezing at first render.
  it('reads an explicit instant rather than the system clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T23:30:00Z'))

    const later = Date.parse('2026-08-28T10:00:00Z')

    expect(todayInZone('UTC', later)).toBe('2026-08-28')
    expect(todayInZone('UTC', new Date(later))).toBe('2026-08-28')
  })
})

describe('middayUtc', () => {
  it('lands inside the day for any timezone', () => {
    expect(middayUtc('2026-08-27').toISOString()).toBe('2026-08-27T12:00:00.000Z')
  })
})

describe('formatDayLong', () => {
  it('names the weekday of the ISO day itself', () => {
    expect(formatDayLong('2026-08-27')).toBe('Thursday 27 August')
  })
})

describe('formatRelative', () => {
  const now = Date.parse('2026-08-27T12:00:00Z')

  it('describes recency in the largest sensible unit', () => {
    expect(formatRelative(now - 30_000, now)).toBe('just now')
    expect(formatRelative(now - 5 * 60_000, now)).toBe('5m ago')
    expect(formatRelative(now - 3 * 3_600_000, now)).toBe('3h ago')
    expect(formatRelative(now - 2 * 86_400_000, now)).toBe('2d ago')
  })
})
