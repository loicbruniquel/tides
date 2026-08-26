/**
 * The largest delay `setTimeout` accepts.
 *
 * The delay is a 32-bit signed integer in WebIDL, so anything larger wraps negative and
 * is then clamped to zero — the timer fires **immediately** instead of never. Multi-week
 * durations are exactly the size that trips this, and nothing warns you at runtime.
 */
export const MAX_TIMER_MS = 2_147_483_647

/** Brings a duration into the range `setTimeout` can actually represent. */
export function clampTimeout(ms: number): number {
  if (!Number.isFinite(ms)) return MAX_TIMER_MS
  return Math.min(Math.max(ms, 0), MAX_TIMER_MS)
}
