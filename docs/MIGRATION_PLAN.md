# Migration plan — Quasar/Vue 2 → Vue 3 + Vite

Rewrite of the Tides PWA onto a modern stack, keeping the existing tide API and the
existing look-and-feel (modernised), with real offline support.

## Decisions taken

| Area | Decision | Why |
|---|---|---|
| Framework | **Vue 3 + Vite, SPA, TypeScript** | No SEO/SSR need, so Nuxt's Nitro layer and build weight buy nothing. The SVG graph is already Vue and is the bulk of the real logic — React would mean rewriting it for no gain. |
| UI kit | **shadcn-vue + Tailwind v4** (Reka UI primitives) | Components are vendored into the repo as source, so we own the styling. Ships the calendar/dialog/toast/popover primitives this app needs, with no runtime theme layer. |
| Icons | **Phosphor** — [`@phosphor-icons/vue`](https://github.com/phosphor-icons/vue) | Consistent, friendly family with six weights, tree-shakeable named imports. Replaces the Lucide icons shadcn-vue vendors by default. MIT. |
| Map | **Leaflet** (`leaflet` + thin Vue wrapper) | Replaces `mapbox-gl` + `vue-mapbox`; no access token, much smaller. |
| Tide cache | **IndexedDB** | localStorage is synchronous (jank on mobile), string-only, ~5 MB cap. IDB is async and structured. |
| Station list | **localStorage** | Tiny, and a synchronous read at boot avoids an empty-list flash. Deliberate split from the tide cache. |
| Data fetching | **TanStack Query (vue-query)** persisted to IDB | Gives stale-while-revalidate, offline reads, prefetch and dedup in one mechanism instead of a hand-rolled cache. |
| Auth | **Removed** | The backend it talks to has never been part of this repo and isn't deployed; production is already device-local. |
| Times | **Station-local timezone** | The API returns the station's local day stamped in UTC. Rendering in device time shifts every high/low when planning a trip from elsewhere. |
| Routing | **History mode** (was hash) | Cleaner URLs; Netlify SPA redirect handles it. Old `/#/...` URLs are not carried over. |

In scope beyond a like-for-like port: place search on the map, "use my location",
dark mode, and swipe navigation between days.

## Target dependencies

```
vue  vue-router  pinia
@tanstack/vue-query  @tanstack/query-persist-client-core  idb-keyval
tailwindcss @tailwindcss/vite  reka-ui  class-variance-authority  clsx  tailwind-merge
@phosphor-icons/vue   # icons
leaflet
suncalc          # kept from the legacy app
tz-lookup        # coordinate → IANA timezone
date-fns  @date-fns/tz
vite-plugin-pwa  workbox-window
-- dev --
typescript  vue-tsc  @vitejs/plugin-vue  eslint  @antfu/eslint-config (or eslint-plugin-vue + typescript-eslint)  vitest  @vue/test-utils
```

Dropped: `quasar`, `@quasar/extras`, `@quasar/app`, `axios` (native `fetch` is enough),
`mapbox-gl`, `vue-mapbox`, `vue-i18n`, `vuex`, babel, webpack, stylint.

## Phase 0 — Prerequisites

1. **Node.js is installed and working** — v26.7.0 at `/usr/bin/node`, with native `fetch`
   and `structuredClone`. Comfortably above Vite 7's floor of Node 20.19 / 22.12.
2. **`npm` is still missing** — on Arch it ships as a package separate from `nodejs`:
   `sudo pacman -S npm`. Nothing below can run until this is done.
3. Work on the **`remaster`** branch: `git checkout -b remaster`.
4. Tag the current state so the legacy build stays reachable: `git tag legacy-quasar`.

## Phase 1 — Scaffold and clear the ground

- Scaffold Vite + Vue 3 + TS into a temp dir and move the config in (the repo is not empty).
- Wire Tailwind v4 via `@tailwindcss/vite`, then `shadcn-vue` init; vendor only the
  components actually used (button, card, dialog, input, calendar, sonner/toast, popover,
  switch, dropdown-menu).
- **Icons** — [`@phosphor-icons/vue`](https://github.com/phosphor-icons/vue):
  - Import by name only: `import { PhAnchor, PhCaretLeft } from "@phosphor-icons/vue"`.
    **Never `app.use(PhosphorIcons)`** — the global install registers every icon and kills
    tree-shaking, which the README warns about explicitly.
  - Defaults are `color="currentColor"`, `size="1em"`, `weight="regular"`, so icons inherit
    Tailwind's `text-*` colour and font-size utilities with no extra wiring. Size them with
    `text-lg`/`text-xl` rather than a `size` prop.
  - Set app-wide defaults at the root with separate injections — `provide("weight", "regular")`,
    `provide("size", "1em")` — not a single config object. Nested providers can override per
    region; use `weight="fill"` or `"bold"` inline for active/selected states.
  - shadcn-vue vendors components that import from `lucide-vue-next` (dialog close, calendar
    chevrons, checkbox tick, …). Swap those imports for the Phosphor equivalent as each
    component is vendored, so `lucide-vue-next` never enters `package.json` at all.
- Delete: `quasar.conf.js`, `babel.config.js`, `.postcssrc.js`, `.stylintrc`, `.eslintrc.js`,
  `.eslintignore`, `yarn.lock`, `src/boot/`, `src/store/`, `src/layouts/`, `src/i18n/`,
  `src/pages/user/`, `src/components/user/`, `src/index.template.html`, `src/css/`.
- Keep and move: `src/statics/icons/` → `public/icons/` (regenerate a maskable 512 and a
  180×180 apple-touch icon), `src/utils/plot.js` → `src/lib/plot.ts`,
  `src/utils/color.js` → `src/lib/color.ts`.
- Path alias `@` → `src`.
- `vue-tsc` + eslint in `npm run check`.

**Checkpoint:** `npm run dev` serves an empty shell; `npm run build` passes.

## Phase 2 — Data layer

**Types** (`src/types.ts`) — `Station`, `TideDay`, `Height`, `Extreme`, `Datum`,
transcribed from the documented API response.

**API** (`src/api/tides.ts`) — `fetchTideDay(lat, lon, isoDate): Promise<TideDay>` against
`https://tidesproxy.mauvaisgout.net/tides/{lat},{lon}/{date}` using `fetch`, with an
`AbortSignal` timeout. Base URL from `VITE_TIDES_API`. CORS is confirmed to reflect any
origin, so no dev proxy is needed.

**Query cache** (`src/lib/query.ts`) —
- `queryKey: ['tides', lat, lon, isoDate]`, coordinates rounded to 2dp so the key is stable.
- **Store and send the precise station coordinates**, exactly as the current app does, and let
  the API do its own rounding (it resolves to the nearest whole degree — presumably to keep its
  cache small). We don't need finer resolution, so the app neither compensates for this nor
  surfaces the grid point in the UI. Do not key the cache on the rounded coordinate either:
  it would dedupe some fetches, but bakes an assumption about a third-party proxy into our
  storage for a negligible saving.
- `staleTime` 6 h, `gcTime` 30 days, `networkMode: 'offlineFirst'`, `retry` with backoff.
- Persist with `persistQueryClient` + an `idb-keyval` store, throttled ~1 s. Tide data is
  immutable once published, so a long persisted cache is safe.
- On boot, evict persisted days older than yesterday.

**Prefetching** —
- Opening a station prefetches today → today + N-1 (**N = 5**, user-configurable in settings).
- On app open with a connection, refresh *today* for every saved station in the background,
  so the list itself is useful offline.

**Stations** (`src/stores/stations.ts`, Pinia) — CRUD over localStorage, `crypto.randomUUID()`
for ids, and a **one-time migration** that reads the legacy `serialized_stations` key and the
legacy `tides_*` keys, imports the stations, and clears the old tide entries.

**Time** (`src/lib/time.ts`) — `tz-lookup` maps station coordinates to an IANA zone; all
formatting goes through `Intl.DateTimeFormat` with that `timeZone`. Day boundaries for the
date control are computed in station time, not device time. SunCalc results are formatted the
same way. A single `useStationTime(station)` composable so no component formats dates itself.

**Checkpoint:** unit tests (Vitest) over `plot.ts` and `time.ts`, including the UTC+1
Morocco case and a negative-height day.

## Phase 3 — Port the tide graph

One component at a time to `<script setup lang="ts">`, preserving the coordinate system
exactly as documented in CLAUDE.md — including the intentional HAT/LAT y inversion.

- `Night` → `Separators` → `NowMarker` → `Path` → `ExtremeDots` → hover dot → capture rect.
- Replace the duplicated mouse/touch handlers with unified **pointer events**.
- Replace the `window.resize` listener with a **`ResizeObserver`** on the SVG.
- Replace the `<defs>` gradient ids with unique per-instance ids (currently a hard-coded
  `id="gradient"`, which collides if two graphs ever render together).
- Fix the aspect-ratio maths to run before first paint rather than after `mounted`.
- Move the colour palette to CSS custom properties so **dark mode** restyles the graph.
- Add **swipe** left/right on the graph to change day (pointer-drag threshold, with the
  existing prev/next buttons kept).

**Checkpoint:** graph renders identically to production for a known day, side by side.

## Phase 4 — Screens

- **Shell** — header with title and settings, offline banner, `<RouterView>` with a fade.
- **Station list** (`/`) — cards showing name, coordinates, and next high/low pulled from
  cached data, so the list is informative offline. Add / edit / delete, reorderable.
- **Station view** (`/stations/:id`) — graph + date control. Non-blocking loading: cached
  data renders immediately, a slim progress bar shows a background revalidation, and a
  "cached, last updated …" note appears when offline.
- **Map picker** (`/stations/new`, `/stations/:id/edit`) — Leaflet, CARTO Voyager tiles
  (no token), centre-crosshair pick as today, plus **Nominatim place search** and a
  **geolocate** button.
- **Settings** — prefetch window (days), theme, clear cache.
- **404**.

## Phase 5 — PWA and offline

- `vite-plugin-pwa` with `registerType: 'prompt'` and a small "new version available" toast.
- Manifest: `standalone`, portrait, theme/background colours, 192/512 + **maskable** icons,
  `apple-touch-icon` 180×180 and `apple-mobile-web-app-*` meta for iOS home-screen install.
- Workbox precaches the app shell; `NavigationRoute` falls back to `index.html` so deep
  links work offline. Tile images get a `CacheFirst` route with a small expiring cache.
- Tide API responses are **not** cached by Workbox — IDB is the single source of truth, so
  there's one TTL and one eviction policy rather than two.
- `navigator.onLine` + `online`/`offline` events drive the offline banner.

**Checkpoint:** Lighthouse PWA pass; DevTools offline reload works; verified installed on
a real iPhone and an Android device.

## Phase 6 — Deploy

- `netlify.toml` (build `npm run build`, publish `dist`) and `public/_redirects`
  with `/* /index.html 200`.
- Deploy to a Netlify preview first and confirm the localStorage migration against a real
  browser profile that has existing stations, before pointing the production domain at it.
- Update CLAUDE.md to describe the new stack and delete the "pre-migration" section.

## Risks and open items

- **`tz-lookup` bundle size** (~30 KB gzipped). If that's unwelcome, the station's UTC offset
  can instead be inferred from the first height sample versus the requested date — no
  dependency, but it can't name the zone or handle a DST change mid-window.
- **Nominatim usage policy** requires a descriptive `User-Agent`/`Referer` and rate limiting;
  fine at this volume, but it must not be called on every keystroke — debounce ~500 ms.
- **iOS PWA storage eviction**: Safari can clear IDB for sites unused for ~7 days unless the
  app is installed to the home screen. Installing avoids it; worth a note in the UI.
- **No test suite exists today**, so the port has no regression net beyond the graph unit
  tests added in Phase 2. Visual comparison against production is the practical check.
