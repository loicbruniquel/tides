<script setup lang="ts">
import { PhCrosshair, PhMagnifyingGlass, PhSpinner } from '@phosphor-icons/vue'
import L from 'leaflet'
import { onMounted, onScopeDispose, ref, watch } from 'vue'

import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { useIsDark } from '@/composables/useIsDark'

import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  latitude: number
  longitude: number
}>()

const emit = defineEmits<{ move: [latitude: number, longitude: number] }>()

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
}
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

const container = ref<HTMLDivElement | null>(null)
const isDark = useIsDark()

let map: L.Map | null = null
let tileLayer: L.TileLayer | null = null

/** Set while the map is being recentred from props, so we don't echo the move back. */
let syncing = false

/** 4 dp is ~11 m — plenty for picking a beach, and keeps URLs and keys tidy. */
function round(value: number): number {
  return Number(value.toFixed(4))
}

onMounted(() => {
  if (!container.value) return

  map = L.map(container.value, {
    center: [props.latitude, props.longitude],
    zoom: 9,
    zoomControl: false,
    attributionControl: true,
  })

  tileLayer = L.tileLayer(isDark.value ? TILES.dark : TILES.light, {
    attribution: ATTRIBUTION,
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  map.on('move', () => {
    if (syncing || !map) return
    const centre = map.getCenter()
    emit('move', round(centre.lat), round(centre.lng))
  })
})

onScopeDispose(() => {
  map?.remove()
  map = null
})

watch(isDark, (dark) => {
  if (!map || !tileLayer) return
  tileLayer.setUrl(dark ? TILES.dark : TILES.light)
})

// Recentre when the coordinates are edited in the form rather than on the map.
watch(
  () => [props.latitude, props.longitude] as const,
  ([latitude, longitude]) => {
    if (!map) return
    const centre = map.getCenter()
    if (
      Math.abs(centre.lat - latitude) < 0.0001 &&
      Math.abs(centre.lng - longitude) < 0.0001
    ) {
      return
    }

    syncing = true
    map.setView([latitude, longitude], map.getZoom())
    syncing = false
  },
)

/* -------------------------------------------------------------------------- */
/* Place search (Nominatim)                                                    */
/* -------------------------------------------------------------------------- */

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

const query = ref('')
const results = ref<SearchResult[]>([])
const searching = ref(false)

let debounce: number | undefined
let inFlight: AbortController | undefined

watch(query, (value) => {
  window.clearTimeout(debounce)
  inFlight?.abort()

  if (value.trim().length < 3) {
    results.value = []
    searching.value = false
    return
  }

  // Nominatim's usage policy forbids per-keystroke querying.
  debounce = window.setTimeout(() => void search(value.trim()), 500)
})

async function search(term: string) {
  searching.value = true
  inFlight = new AbortController()

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', term)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '5')

    const response = await fetch(url, {
      signal: inFlight.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Search failed with ${response.status}`)

    results.value = (await response.json()) as SearchResult[]
  } catch {
    // Offline or rate-limited — the map still works, so fail quietly.
    results.value = []
  } finally {
    searching.value = false
  }
}

function choose(result: SearchResult) {
  const latitude = round(Number.parseFloat(result.lat))
  const longitude = round(Number.parseFloat(result.lon))

  query.value = ''
  results.value = []
  map?.setView([latitude, longitude], 11)
  emit('move', latitude, longitude)
}

const locating = ref(false)

function locate() {
  if (!navigator.geolocation) return
  locating.value = true

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      locating.value = false
      const latitude = round(coords.latitude)
      const longitude = round(coords.longitude)
      map?.setView([latitude, longitude], 11)
      emit('move', latitude, longitude)
    },
    () => (locating.value = false),
    { enableHighAccuracy: true, timeout: 10_000 },
  )
}
</script>

<template>
  <div class="relative size-full">
    <div ref="container" class="size-full" />

    <!-- Fixed crosshair: the map moves under it, so the centre is always the pick. -->
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-1/2"
    >
      <div class="size-4 rounded-full border-2 border-white bg-primary shadow-md" />
      <div class="mx-auto -mt-px h-4 w-px bg-white/70" />
    </div>

    <div class="absolute inset-x-3 top-3 z-[600] mx-auto max-w-md">
      <div class="relative">
        <PhMagnifyingGlass
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="query"
          class="pl-9 shadow-md"
          placeholder="Search for a place…"
          autocomplete="off"
        />
        <PhSpinner
          v-if="searching"
          class="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      </div>

      <ul
        v-if="results.length"
        class="mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
      >
        <li v-for="result in results" :key="result.display_name">
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm hover:bg-accent"
            @click="choose(result)"
          >
            {{ result.display_name }}
          </button>
        </li>
      </ul>
    </div>

    <Button
      variant="default"
      size="icon"
      class="absolute bottom-24 right-3 z-[600] shadow-md"
      aria-label="Use my location"
      :disabled="locating"
      @click="locate"
    >
      <PhSpinner v-if="locating" class="animate-spin" />
      <PhCrosshair v-else />
    </Button>
  </div>
</template>
