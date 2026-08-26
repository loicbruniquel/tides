/**
 * Everything time-related happens in the *station's* timezone, not the device's.
 *
 * The API returns the station's local day with every timestamp stamped UTC, so
 * rendering with the device timezone shifts every high/low when you look at a station
 * abroad — the bug this module exists to prevent. Days are carried as `YYYY-MM-DD`
 * strings so the day cursor can never drift.
 */
import tzlookup from 'tz-lookup'

import type { IsoDay } from '@/types'

/** Falls back to the device zone for coordinates tz-lookup cannot resolve (mid-ocean). */
export function timeZoneFor(latitude: number, longitude: number): string {
  try {
    return tzlookup(latitude, longitude)
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  }
}

// Intl formatters are expensive to construct and the graph builds one per badge, so
// they are memoised per (locale, timezone, shape).
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${timeZone}|${JSON.stringify(options)}`
  let cached = formatterCache.get(key)
  if (!cached) {
    cached = new Intl.DateTimeFormat('en-GB', { timeZone, ...options })
    formatterCache.set(key, cached)
  }
  return cached
}

/** `HH:mm` at the station, from a UNIX timestamp in seconds. */
export function formatTime(dt: number, timeZone: string): string {
  // hourCycle h23 is explicit on purpose: with only `hour12: false`, some locales
  // render midnight as "24:00".
  return formatter(timeZone, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(dt * 1000))
}

/** Today's calendar date *at the station*, as `YYYY-MM-DD`. */
export function todayInZone(timeZone: string): IsoDay {
  // en-CA renders ISO-ordered dates, which is exactly the shape the API wants.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Shifts an ISO day by whole days. Pure UTC arithmetic, so DST can never bite. */
export function addDays(day: IsoDay, delta: number): IsoDay {
  const [year, month, date] = day.split('-').map(Number)
  const shifted = new Date(Date.UTC(year!, month! - 1, date!) + delta * 86_400_000)
  return shifted.toISOString().slice(0, 10)
}

/** Whole days between two ISO days (`b - a`). */
export function daysBetween(a: IsoDay, b: IsoDay): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

/**
 * Midday UTC on an ISO day — a stable instant inside that day for any timezone, which
 * is what SunCalc wants to compute sunrise and sunset.
 */
export function middayUtc(day: IsoDay): Date {
  return new Date(`${day}T12:00:00Z`)
}

/** e.g. "Thursday 27 August". Deliberately locale-formatted, not hand-assembled. */
export function formatDayLong(day: IsoDay): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(middayUtc(day))
}

/** e.g. "Thu 27 Aug", for tighter layouts. */
export function formatDayShort(day: IsoDay): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(middayUtc(day))
}

/**
 * A short label describing how far a cached timestamp is in the past, e.g. "2h ago".
 * Used by the offline / stale-data notice.
 */
export function formatRelative(from: number, now = Date.now()): string {
  const seconds = Math.round((now - from) / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  return `${Math.round(hours / 24)}d ago`
}
