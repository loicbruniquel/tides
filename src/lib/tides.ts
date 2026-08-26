import type { Extreme, TideDay } from '@/types'

/** The next high or low water at or after `atSeconds`, if the day still holds one. */
export function nextExtreme(
  day: TideDay | undefined,
  atSeconds: number = Date.now() / 1000,
): Extreme | undefined {
  return day?.extremes.find((extreme) => extreme.dt >= atSeconds)
}

/** Water level interpolated between the two samples either side of `atSeconds`. */
export function heightAt(day: TideDay | undefined, atSeconds: number): number | undefined {
  if (!day || day.heights.length === 0) return undefined

  const afterIndex = day.heights.findIndex((sample) => sample.dt > atSeconds)
  if (afterIndex <= 0) {
    // Before the first sample, or after the last one.
    return afterIndex === 0 ? day.heights[0]!.height : undefined
  }

  const after = day.heights[afterIndex]!
  const before = day.heights[afterIndex - 1]!
  const span = after.dt - before.dt
  if (span === 0) return before.height

  const ratio = (atSeconds - before.dt) / span
  return before.height + (after.height - before.height) * ratio
}

/** Whether the tide is currently coming in, judged from the next extreme. */
export function isRising(day: TideDay | undefined, atSeconds: number): boolean | undefined {
  const next = nextExtreme(day, atSeconds)
  if (!next) return undefined
  return next.type === 'High'
}
