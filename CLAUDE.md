# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this app is

**Tides** — a small personal PWA showing tide height graphs and high/low water times for
arbitrary coastal locations. The user keeps their own list of "stations" (a name + a
lat/lon pair), opens one, and browses predictions day by day on an interactive SVG graph.

It is a device-local, offline-first tool. There is no account system, no server of our
own, and no SEO or SSR requirement.

## Stack

Vue 3 + Vite, SPA, TypeScript. Tailwind v4 (CSS-first config, no `tailwind.config.js`).
[Reka UI](https://reka-ui.com) for headless primitives, [Phosphor](https://phosphoricons.com)
for icons, Pinia for stores, TanStack Query persisted to IndexedDB for data,
Leaflet for the map, `vite-plugin-pwa` (Workbox) for the service worker. Deployed to
Netlify.

Migrated from Vue 2 / Quasar 1 / Webpack in 2026; `docs/MIGRATION_PLAN.md` records why the
stack looks like this. The legacy tree is gone — `git tag legacy-quasar` marks the last
commit that had it.

## Commands

```bash
npm install
npm run dev        # http://localhost:8481
npm run build      # vue-tsc --noEmit && vite build → dist/
npm run preview    # serve the built app; needed to exercise the service worker
npm run check      # vue-tsc + eslint, must be clean
npm run lint       # eslint --fix
npm run test       # vitest (34 tests)
```

The service worker is inactive under `dev`. Use `build` + `preview` to test install and
offline behaviour.

`scripts/make-icons.py` regenerates the whole icon set from one SVG master (needs
`rsvg-convert` and ImageMagick). It is not part of the build — run it by hand after
changing the mark or the palette.

## Source layout

```
src/
  main.ts          rehydrates the query cache, then mounts
  router.ts        a single file, not a directory
  types.ts         Station, TideDay, Height, Extreme, Datum, IsoDay
  api/tides.ts     the one network call
  lib/
    plot.ts        graph geometry, ported from the Quasar app  (+ .spec)
    tides.ts       nextExtreme / heightAt / isRising           (+ .spec)
    time.ts        station-timezone formatting and day maths   (+ .spec)
    query.ts       QueryClient, IndexedDB persistence, eviction
    storage.ts     total wrappers over localStorage
    utils.ts       cn()
  stores/          stations (localStorage), settings (theme, prefetch window)
  composables/     useTides (query + prefetch), useOnline
  components/
    tides/         TideGraph.vue, DateControl.vue, CalendarGrid.vue, graph/*
    stations/      StationCard.vue
    map/           LocationPicker.vue
    layout/        AppHeader, OfflineBanner, UpdatePrompt
    ui/            Button, Input — shadcn-style, cva + Reka `Primitive`
  views/           Stations, Station, StationEditor, Settings, NotFound
```

## The tide graph — read this before touching it

`components/tides/TideGraph.vue` composes layered SVG children in one
`viewBox="0 -10 100 120"` with `preserveAspectRatio="none"`:

`GraphNight` (day/night bands) → `GraphSeparators` (quarter-day gridlines) →
`GraphNowMarker` → `GraphPath` (smoothed curve) → `GraphExtremeDots` → pointer dot →
a transparent capture `<rect>`.

Two HTML overlays sit above it: `GraphBadges` (high/low labels positioned in `%`) and
`GraphInfo` (the readout that follows the pointer).

### Coordinate system — the non-obvious part

`lib/plot.ts` normalises everything into a **0–100 space**:

- **x** = unix `dt`, mapped from the first to the last height sample of the day.
- **y** = metres, mapped between `minY` and `maxY` — **deliberately inverted**. `minY` is
  the `HAT` datum (Highest Astronomical Tide) and `maxY` is `LAT` (Lowest). SVG's y axis
  grows downward, so high water must map to a *small* y. **Do not "fix" this.**

The `-10` offset and `120` height give headroom so the curve and badges are not clipped.

Because `preserveAspectRatio="none"` stretches the SVG non-uniformly, round dots must be
`<ellipse>` with `rx`/`ry` corrected by the measured aspect ratio (`dotWidth()` /
`dotHeight()`, fed by a `ResizeObserver`).

`GraphBadges` is inset by `8.3333%` top and bottom — that is `10/120`, which lines the
overlay's 0–100% up with the SVG's 0–100 band.

Gradient ids are per-instance via `useId()`. The Quasar version hard-coded `id="gradient"`,
which collides the moment two graphs render together.

### Gesture handling

One pointer surface serves two gestures. A touch drag is classified once, on first
movement: a horizontal flick (>24px, mostly sideways, within 250ms) becomes a **swipe**
that changes day; anything else becomes a **scrub**. Mouse input always scrubs. The
capture rect sets `touch-action: pan-y` so the page still scrolls vertically.

## Time — always the station's timezone

The API returns the station's **local day** with every timestamp stamped UTC. Rendering in
the device timezone shifts every high and low when looking at a station abroad; the Quasar
app had exactly that bug.

Everything goes through `lib/time.ts`, which resolves an IANA zone with `tz-lookup` and
formats via `Intl` with an explicit `hourCycle: 'h23'`. Days are carried as `YYYY-MM-DD`
**strings** (`IsoDay`), never `Date`s, so the day cursor cannot drift. `addDays` is pure
UTC arithmetic and is therefore DST-proof.

## Data and offline

- **Tide payloads → IndexedDB**, as a persisted TanStack Query cache (`lib/query.ts`).
  `staleTime` 6h, `gcTime` 30 days, `networkMode: 'offlineFirst'`.
- `main.ts` **awaits rehydration before mounting**. Mounting first renders an empty cache
  for a frame and shows nothing at all on an offline launch.
- Opening a station prefetches N days ahead (5 by default, set in Settings). Opening the
  app refreshes today for every station, so the list works offline too.
- **Stations → localStorage** under `tides.stations`. Small, and a synchronous read at
  boot avoids an empty-list flash. Deliberately not in IndexedDB.
- The stations store still migrates the Quasar `serialized_stations` key on first run. It
  is inert on the current origin and only matters if `tides.mauvaisgout.net` is ever
  repointed at this deployment.
- Workbox precaches the app shell and caches map tiles `CacheFirst`. Tide responses are
  **not** cached by Workbox — IndexedDB is their single source of truth, so there is one
  TTL and one eviction policy rather than two.

## Tide API

Read-only, not ours, not to be changed.

```
GET https://tidesproxy.mauvaisgout.net/tides/{lat},{lon}/{YYYY-MM-DD}
```

```jsonc
{
  "heights":  [{ "dt": 1787785200, "date": "2026-08-26T23:00+0000", "height": 0.179 }, ...],  // 48, half-hourly
  "extremes": [{ "dt": 1787794560, "date": "2026-08-27T01:36+0000", "height": 1.021, "type": "High" }, ...],
  "lat": 34, "lon": -7,                     // request coords rounded to the nearest whole degree
  "datums":   [{ "name": "HAT", "height": 1.921 }, ...],  // 22 entries
  "cached": "2026-08-24 10:39:01"
}
```

- Heights are metres relative to MSL and are frequently negative.
- `dt` is unix seconds; every `date` string is UTC.
- The window is the **station's local day**. For the Morocco example (UTC+1) samples run
  `23:00Z` the previous day → `22:30Z`.
- `Cache-Control: no-cache, private`, so HTTP caching cannot be relied on.
- The graph needs `datums` for HAT/LAT — cache the whole payload, not just heights.
- **Coordinates are rounded to the nearest whole degree.** `33.88,-7.04`, `34.02,-6.83`
  and `34.49,-6.51` all return byte-identical data for `(34, -7)`. A 1° cell here is
  ~111 × ~92 km, so stations tens of kilometres apart can share a curve. This is the
  API's design, not a bug in our cache. We store precise coordinates and let it round —
  do not compensate, and do not key the cache on the rounded value.
- CORS reflects any origin, so no dev proxy is needed.

## Map

Leaflet with **Esri World Imagery** tiles — no API key, usable to zoom 19. Satellite
because the task is picking a point on a beach. Note Esri serves `{z}/{y}/{x}`, row before
column, unlike every other provider; swapping them returns tiles from the wrong place
without erroring.

CARTO was the original choice and now watermarks unauthenticated tiles. Esri's
`World_Ocean_Base` has lovely bathymetry but stops at zoom 10 over Morocco, so it is
unusable as a picker basemap.

Place search is Nominatim, debounced 500ms — its usage policy forbids per-keystroke
querying.

## Theming

Tokens are CSS custom properties in `assets/main.css`, defined on `:root` and overridden
under `.dark`, then exposed to Tailwind through `@theme inline`. The graph reads the same
tokens (`--tide-high`, `--tide-low`, `--graph-night`, …), which is what lets dark mode
restyle it without touching component code.

`index.html` applies the stored theme in a blocking script **before first paint**; it
reads `tides.theme` as a raw string and must stay in sync with `stores/settings.ts`.

## Deployment

Netlify, from `netlify.toml` — build `npm run build`, publish `dist`, Node 22, SPA
fallback, and `must-revalidate` on `/sw.js`.

- **No environment variables are required.** `VITE_TIDES_API` exists and defaults to the
  proxy. `VITE_*` values are inlined at build time and are public — never a secret.
- **Never set `NODE_ENV=production`** in the Netlify environment: npm would skip
  devDependencies and `vite` and `vue-tsc` would vanish.
- Only `package-lock.json` may exist. A stray `yarn.lock` makes Netlify install with Yarn
  instead of npm, which is what broke the first deploy.

## Conventions

- `@/` aliases `src/`.
- `npm run check` must pass — it is `vue-tsc --noEmit` plus eslint, and it gates the build.
- Purely cosmetic `vue/*` formatting rules are disabled in `eslint.config.js`; don't
  reflow templates to satisfy rules that aren't on.
- Pure logic lives in `lib/` with a `.spec.ts` beside it. Components are not unit-tested;
  the graph is verified by eye against production.
