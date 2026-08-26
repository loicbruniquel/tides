import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { fetchTideDay } from '@/api/tides'
import { queryClient, tideQueryKey } from '@/lib/query'
import { addDays } from '@/lib/time'
import type { IsoDay, Station, TideDay } from '@/types'

/**
 * One station-day, served stale-while-revalidate.
 *
 * `networkMode: 'offlineFirst'` (set on the client) means cached data renders straight
 * away and a refetch happens behind it, so navigation never blocks on the network.
 */
export function useTideDay(
  station: MaybeRefOrGetter<Station | undefined>,
  day: MaybeRefOrGetter<IsoDay>,
) {
  const key = computed(() => {
    const current = toValue(station)
    if (!current) return ['tides', 'pending'] as const
    return tideQueryKey(current.latitude, current.longitude, toValue(day))
  })

  return useQuery({
    queryKey: key,
    enabled: computed(() => toValue(station) !== undefined),
    queryFn: ({ signal }) => {
      const current = toValue(station)!
      return fetchTideDay(current.latitude, current.longitude, toValue(day), signal)
    },
  })
}

function prefetchDay(station: Station, day: IsoDay) {
  return queryClient.prefetchQuery({
    queryKey: tideQueryKey(station.latitude, station.longitude, day),
    queryFn: ({ signal }) =>
      fetchTideDay(station.latitude, station.longitude, day, signal),
  })
}

/**
 * Warms the cache for `count` days starting at `from`, so that flipping forward a day
 * — or losing signal entirely — is instant.
 *
 * Failures are swallowed: this is opportunistic, and the visible query owns error
 * reporting for the day actually on screen.
 */
export async function prefetchStationDays(
  station: Station,
  from: IsoDay,
  count: number,
): Promise<void> {
  const days = Array.from({ length: count }, (_, index) => addDays(from, index))
  await Promise.allSettled(days.map((day) => prefetchDay(station, day)))
}

/**
 * Refreshes today for every saved station, so the station list can show next high and
 * low water even with no connection.
 */
export async function refreshTodayForAll(
  entries: Array<{ station: Station; day: IsoDay }>,
): Promise<void> {
  await Promise.allSettled(entries.map(({ station, day }) => prefetchDay(station, day)))
}

/** Reads a station-day straight from the cache without triggering a fetch. */
export function cachedTideDay(station: Station, day: IsoDay): TideDay | undefined {
  return queryClient.getQueryData<TideDay>(
    tideQueryKey(station.latitude, station.longitude, day),
  )
}
