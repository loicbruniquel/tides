import {
  persistQueryClient,
  type PersistedClient,
  type Persister,
} from '@tanstack/query-persist-client-core'
import { QueryClient } from '@tanstack/vue-query'
import { clear, createStore, del, get, set } from 'idb-keyval'

import type { IsoDay } from '@/types'

import { addDays, todayInZone } from './time'

const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

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
      gcTime: CACHE_MAX_AGE_MS,
      // Serve cached data first and revalidate behind it; never block on the network.
      networkMode: 'offlineFirst',
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
  },
})

function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(CLIENT_KEY, client, idbStore)
    },
    restoreClient: async () => get<PersistedClient>(CLIENT_KEY, idbStore),
    removeClient: async () => {
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
