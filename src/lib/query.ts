import {
  persistQueryClient,
  type PersistedClient,
  type Persister,
} from '@tanstack/query-persist-client-core'
import { QueryClient } from '@tanstack/vue-query'
import { clear, createStore, del, get, set } from 'idb-keyval'

import type { IsoDay } from '@/types'

import { addDays, todayInZone } from './time'
import { clampTimeout } from './timers'

const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

/**
 * How long an unobserved query survives in memory.
 *
 * **Must be clamped.** TanStack Query schedules garbage collection with a plain
 * `setTimeout(…, gcTime)`, and 30 days overflows a 32-bit delay: it wrapped negative,
 * fired immediately, and every tide day was evicted a tick after its component
 * unmounted. Dehydration then had nothing to write, so IndexedDB held an empty cache and
 * the app could not open a station offline at all.
 */
const GC_TIME_MS = clampTimeout(CACHE_MAX_AGE_MS)

/** Coalesce the bursts of cache events a prefetch produces into one IndexedDB write. */
const PERSIST_DEBOUNCE_MS = 1000

/** Bump to discard every persisted entry after a breaking change to the cached shape. */
const CACHE_BUSTER = 'tides-v2'

const idbStore = createStore('tides', 'query-cache')
const CLIENT_KEY = 'query-client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tide predictions for a past or present day never change, so a long stale time
      // costs nothing and keeps navigation instant.
      staleTime: 6 * 60 * 60 * 1000,
      gcTime: GC_TIME_MS,
      // Serve cached data first and revalidate behind it; never block on the network.
      networkMode: 'offlineFirst',
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Persists the dehydrated client to IndexedDB, debounced.
 *
 * TanStack Query saves on *every* cache event, and a five-day prefetch fires a dozen of
 * them, each rewriting the whole blob. The trailing debounce collapses that burst into
 * one write; `pagehide` flushes it, because iOS kills a backgrounded home-screen app
 * without warning and a dropped final write is a day lost from the offline cache.
 */
function createIdbPersister(): Persister {
  let pending: PersistedClient | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const write = async () => {
    const client = pending
    if (!client) return

    pending = undefined
    timer = undefined

    // A failed write must never surface as an unhandled rejection: persistence is a
    // convenience, and the in-memory cache is still correct without it.
    await set(CLIENT_KEY, client, idbStore).catch(() => undefined)
  }

  const flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    void write()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
  }

  return {
    persistClient: (client: PersistedClient) => {
      pending = client
      if (timer === undefined) timer = setTimeout(write, PERSIST_DEBOUNCE_MS)
    },
    restoreClient: async () => get<PersistedClient>(CLIENT_KEY, idbStore),
    removeClient: async () => {
      pending = undefined
      if (timer !== undefined) {
        clearTimeout(timer)
        timer = undefined
      }
      await del(CLIENT_KEY, idbStore)
    },
  }
}

/**
 * Rehydrates the cache from IndexedDB and starts persisting changes back to it.
 *
 * Must be awaited before the app mounts, otherwise the first render sees an empty
 * cache and an offline launch shows nothing.
 */
export async function restoreQueryCache(): Promise<void> {
  const [, restored] = persistQueryClient({
    queryClient,
    persister: createIdbPersister(),
    maxAge: CACHE_MAX_AGE_MS,
    buster: CACHE_BUSTER,
  })

  try {
    await restored
  } catch {
    // A corrupt or unreadable cache must never stop the app booting.
    await clear(idbStore).catch(() => undefined)
  }
}

/** The query key for one station-day. Coordinates are used exactly as stored. */
export function tideQueryKey(latitude: number, longitude: number, day: IsoDay) {
  return ['tides', latitude, longitude, day] as const
}

/**
 * Drops cached days that are now in the past. Yesterday is kept so that crossing
 * midnight while offline doesn't blank the screen.
 */
export function evictStaleDays(): void {
  const cutoff = addDays(todayInZone('UTC'), -1)

  for (const query of queryClient.getQueryCache().findAll({ queryKey: ['tides'] })) {
    const day = query.queryKey[3]
    if (typeof day === 'string' && day < cutoff) {
      queryClient.removeQueries({ queryKey: query.queryKey, exact: true })
    }
  }
}

/** Wipes every cached prediction. Exposed through Settings. */
export async function clearTideCache(): Promise<void> {
  queryClient.removeQueries({ queryKey: ['tides'] })
  await clear(idbStore).catch(() => undefined)
}
