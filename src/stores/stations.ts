import { defineStore } from 'pinia'
import { ref } from 'vue'

import { allKeys, readJson, removeKey, writeJson } from '@/lib/storage'
import type { Station } from '@/types'

const STORAGE_KEY = 'tides.stations'

/** Keys written by the Quasar app, migrated once then removed. */
const LEGACY_STATIONS_KEY = 'serialized_stations'
const LEGACY_TIDE_PREFIX = 'tides_'

interface LegacyStation {
  id?: unknown
  name?: unknown
  // The legacy map picker wrote `coord.lat.toFixed(2)`, so these arrive as strings.
  latitude?: unknown
  longitude?: unknown
}

function toNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

function newId(): string {
  // randomUUID needs a secure context; localhost and https both qualify, but a plain
  // http LAN preview does not.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Imports stations saved by the Quasar app, once. Returns the migrated list, or null
 * if there was nothing to migrate.
 */
function migrateLegacyStations(): Station[] | null {
  const legacy = readJson<LegacyStation[] | null>(LEGACY_STATIONS_KEY, null)
  if (!Array.isArray(legacy)) return null

  const migrated: Station[] = []
  for (const entry of legacy) {
    const latitude = toNumber(entry?.latitude)
    const longitude = toNumber(entry?.longitude)
    if (latitude === null || longitude === null) continue

    migrated.push({
      id: typeof entry.id === 'string' && entry.id ? entry.id : newId(),
      name: typeof entry.name === 'string' && entry.name ? entry.name : 'Unnamed station',
      latitude,
      longitude,
    })
  }

  removeKey(LEGACY_STATIONS_KEY)

  // The old per-day tide entries are superseded by the IndexedDB cache; leaving them
  // would just consume the localStorage quota.
  for (const key of allKeys()) {
    if (key.startsWith(LEGACY_TIDE_PREFIX)) removeKey(key)
  }

  return migrated
}

function load(): Station[] {
  const existing = readJson<Station[] | null>(STORAGE_KEY, null)
  if (Array.isArray(existing)) return existing

  const migrated = migrateLegacyStations()
  if (migrated) {
    writeJson(STORAGE_KEY, migrated)
    return migrated
  }

  return []
}

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>(load())

  function persist() {
    writeJson(STORAGE_KEY, stations.value)
  }

  function byId(id: string): Station | undefined {
    return stations.value.find((station) => station.id === id)
  }

  function add(data: Omit<Station, 'id'>): Station {
    const station: Station = { ...data, id: newId() }
    stations.value.push(station)
    persist()
    return station
  }

  function update(id: string, data: Omit<Station, 'id'>): Station | undefined {
    const index = stations.value.findIndex((station) => station.id === id)
    if (index === -1) return undefined

    const updated: Station = { ...data, id }
    stations.value.splice(index, 1, updated)
    persist()
    return updated
  }

  function remove(id: string): void {
    stations.value = stations.value.filter((station) => station.id !== id)
    persist()
  }

  function move(id: string, delta: number): void {
    const from = stations.value.findIndex((station) => station.id === id)
    if (from === -1) return

    const to = from + delta
    if (to < 0 || to >= stations.value.length) return

    const [moved] = stations.value.splice(from, 1)
    stations.value.splice(to, 0, moved!)
    persist()
  }

  return { stations, byId, add, update, remove, move }
})
