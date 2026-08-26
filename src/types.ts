/** A station the user has saved. Coordinates are stored exactly as picked — the API
 *  does its own rounding (see docs/MIGRATION_PLAN.md). */
export interface Station {
  id: string
  name: string
  latitude: number
  longitude: number
}

/** One sampled water level. `dt` is a UNIX timestamp in seconds; `height` is metres
 *  relative to MSL and may be negative. */
export interface Height {
  dt: number
  date: string
  height: number
}

export type ExtremeType = 'High' | 'Low'

export interface Extreme extends Height {
  type: ExtremeType
}

/** Tidal datum, e.g. HAT (Highest Astronomical Tide) or LAT (Lowest). */
export interface Datum {
  name: string
  height: number
}

/** One day of predictions, as returned by the tides proxy. The window covers the
 *  station's *local* day even though every timestamp is expressed in UTC. */
export interface TideDay {
  heights: Height[]
  extremes: Extreme[]
  /** The grid point the API actually used — the request coordinates rounded. */
  lat: number
  lon: number
  datums: Datum[]
  cached?: string
}

/** A calendar day at the station, always `YYYY-MM-DD`.
 *
 *  The app deliberately carries days as strings rather than `Date` objects: it is the
 *  form the API takes, and it removes any chance of a device-timezone shift creeping
 *  into the day cursor. */
export type IsoDay = string
