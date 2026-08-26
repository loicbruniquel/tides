import type { IsoDay, TideDay } from '@/types'

const BASE_URL = (
  import.meta.env.VITE_TIDES_API ?? 'https://tidesproxy.mauvaisgout.net'
).replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 20_000

export class TideFetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'TideFetchError'
  }
}

/**
 * `AbortSignal.any` is still too new to rely on across the iOS versions this PWA
 * targets, so the caller's signal and the timeout are merged by hand.
 */
function withTimeout(signal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('Request timed out')), ms)

  const onAbort = () => controller.abort(signal?.reason)
  if (signal) {
    if (signal.aborted) onAbort()
    else signal.addEventListener('abort', onAbort, { once: true })
  }

  const cleanup = () => {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }

  return { signal: controller.signal, cleanup }
}

/**
 * Fetches one day of predictions.
 *
 * Coordinates are sent exactly as stored — the proxy rounds them to its own grid, and
 * the app deliberately does not compensate for that.
 */
export async function fetchTideDay(
  latitude: number,
  longitude: number,
  day: IsoDay,
  signal?: AbortSignal,
): Promise<TideDay> {
  const { signal: merged, cleanup } = withTimeout(signal, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}/tides/${latitude},${longitude}/${day}`, {
      signal: merged,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new TideFetchError(
        `Tide request failed with ${response.status}`,
        response.status,
      )
    }

    const data = (await response.json()) as TideDay

    // A day with no samples would divide by zero all through the graph geometry.
    if (!Array.isArray(data.heights) || data.heights.length === 0) {
      throw new TideFetchError('Tide response contained no height samples')
    }

    return data
  } finally {
    cleanup()
  }
}
