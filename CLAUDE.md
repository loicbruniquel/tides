# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this app is

**Tides** — a small personal PWA that shows tide height graphs and high/low tide times for
arbitrary coastal locations. The user maintains their own list of "stations" (a name + a
lat/lon pair), opens one, and browses tide predictions day by day on an interactive SVG
graph. Live at <https://tides.mauvaisgout.net/#/> (Netlify).

There is no SEO or SSR requirement. It is a device-local, offline-first tool.

## Status: pre-migration

This repository currently holds the **legacy Vue 2 / Quasar 1 / Webpack** implementation.
A rewrite to Vue 3 + Vite is planned (see "Planned stack" below). Until that lands, the
notes here describe the legacy code.

### The repo is behind what is deployed

The deployed bundle at tides.mauvaisgout.net does **not** match `master`. Differences
observed by inspecting the deployed chunks:

| | `master` (this repo) | Deployed build |
|---|---|---|
| API base URL | `http://localhost:1337` | `https://tidesproxy.mauvaisgout.net/` |
| Tides endpoint | `stations/:stationId/tides/:day` | `/tides/:lat,:lon/:day` |
| Tide response caching | none | `LocalStorage`, keys prefixed `tides_` |
| Auth | login/register wired up against `localhost:1337` | stations are local-only |

Treat **the deployed behaviour as the reference for product intent**, and `master` as an
older snapshot. Do not assume `src/utils/api.js` reflects what production does.

## Legacy stack

- Vue 2 + Quasar v1 (`@quasar/app` v1 CLI, Webpack 4), SCSS, ESLint standard config.
- Vuex for `user` + `pageTitle` only.
- `vue-router` in **hash mode** (`build.vueRouterMode: 'hash'`) — hence the `/#/` URLs.
- `axios` for HTTP, `suncalc` for sunrise/sunset, `mapbox-gl` + `vue-mapbox` for the map.
- `vue-i18n` is bootstrapped but effectively unused (only `failed` / `success` strings).
- PWA is configured in `quasar.conf.js` (`workboxPluginMode: 'GenerateSW'`) but the PWA
  mode has to be selected at build time (`quasar build -m pwa`).

There is no test suite (`yarn test` is a no-op) and no CI config in the repo.

## Commands

Node v26.7.0 is installed, but **`npm` is not** — on this CachyOS/Arch host it is a
separate package: `sudo pacman -S npm`.

```bash
yarn                       # install
quasar dev                 # dev server on port 8481, opens a browser
quasar build -m pwa        # production PWA build into dist/pwa
yarn run lint              # eslint over src
```

The legacy toolchain declares `node >= 10.18.1`. Getting it to build on the installed Node 26
is unlikely to be worth attempting — Webpack 4's md4 hashing needs
`NODE_OPTIONS=--openssl-legacy-provider`, and `@quasar/app` v1 predates this Node by many
major versions. The rewrite replaces it, so don't chase this.

## Source layout

```
src/
  boot/            quasar boot files (axios, i18n)
  layouts/         Main.vue (header + router-view), Fullscreen.vue (map pages)
  pages/           Index.vue (station list), stations/{View,New,Edit}.vue, user/{Login,Register}.vue
  components/
    DateControl.vue          prev/next day + calendar dialog
    stations/                List.vue, Form.vue, map/Map.vue (mapbox)
    tides/Graph/             the SVG tide graph (see below)
    user/Mini.vue            login/logout header widget
  utils/
    api.js         axios client; `stations` resolves to remote or local depending on token
    local.js       localStorage-backed station CRUD
    plot.js        bezier smoothing + coordinate normalisation math
    color.js       hex colour blending
  router/routes.js
  store/index.js
```

## The tide graph (`src/components/tides/Graph/`)

This is the most valuable part of the codebase and the part worth porting carefully rather
than rewriting. `Index.vue` composes layered SVG children inside a single
`viewBox="0 -10 100 120"` with `preserveAspectRatio="none"`:

`Night` (day/night background bands) → `Separators` (6h gridlines + mid line) →
`NowMarker` (red current-time line) → `Path` (smoothed tide curve) → `ExtremeDots` →
hover/touch dot → a transparent `<rect>` that captures pointer events.

Two HTML overlays sit on top of the SVG: `PathBadges`/`ExtremeBadge` (high/low time labels
positioned in `%`) and `Info` (time + height readout that follows the pointer).

### Coordinate system — the non-obvious part

Everything is normalised into a **0–100 percentage space** by `utils/plot.js`:

- **x** = unix timestamp `dt`, mapped from the first to the last height sample of the day.
- **y** = height in metres, mapped between `minY` and `maxY` — and these are **deliberately
  inverted**: `minY` is the `HAT` datum (Highest Astronomical Tide) and `maxY` is `LAT`
  (Lowest Astronomical Tide). Because SVG's y axis grows downward, a high tide must map to a
  *small* y. Do not "fix" this inversion.

The `-10` y-offset and `120` height in the viewBox give headroom so the curve and badges are
not clipped at the extremes.

`svgPath()` builds a smoothed cubic-bezier path; control points are derived from the line
between the neighbouring points, scaled by `SMOOTH_RATIO = 0.2`. `yForX()` linearly
interpolates between the two nearest samples so the hover readout tracks the curve.

Because `preserveAspectRatio="none"` stretches the SVG non-uniformly, circular dots must
be drawn as `<ellipse>` with `rx`/`ry` corrected by the measured aspect ratio (`dotWith()` /
`dotHeight()` in `Index.vue`). A resize listener keeps `svgDimensions` current.

## Tide API

Not to be changed — it is an existing proxy, consumed read-only.

```
GET https://tidesproxy.mauvaisgout.net/tides/{lat},{lon}/{YYYY-MM-DD}
```

Example: `https://tidesproxy.mauvaisgout.net/tides/33.88,-7.04/2026-08-27`

Response (~4 KB, `Content-Type: application/json`):

```jsonc
{
  "heights":  [{ "dt": 1787785200, "date": "2026-08-26T23:00+0000", "height": 0.179 }, ...],  // 48 samples, every 30 min
  "extremes": [{ "dt": 1787794560, "date": "2026-08-27T01:36+0000", "height": 1.021, "type": "High" }, ...],  // "High" | "Low"
  "lat": 34, "lon": -7,                     // request coords rounded to the nearest whole degree
  "datums":   [{ "name": "HAT", "height": 1.921 }, ...],  // 22 entries: HAT, LAT, MSL, MHWS, ...
  "cached": "2026-08-24 10:39:01"
}
```

Notes:

- Heights are **metres relative to MSL** and can be negative.
- `dt` is a UNIX timestamp; every `date` string is expressed in **UTC** (`+0000`).
- The 24-hour window returned is the **station's local day**, not the UTC day. For the
  Morocco example above (UTC+1) the samples run `23:00Z` the previous day → `22:30Z`. The
  station's UTC offset can therefore be inferred from the first sample, or looked up from
  the coordinates.
- The response carries `Cache-Control: no-cache, private`, so HTTP caching must not be
  relied on — the app caches deliberately in its own storage.
- The graph needs `datums` (for HAT/LAT), so cache the whole payload, not just heights.
- **Coordinates are rounded to the nearest whole degree**, and the returned `lat`/`lon` report
  the grid point used. `33.88,-7.04`, `34.02,-6.83` and `34.49,-6.51` all return byte-identical
  data for `(34, -7)`. A 1° cell here is ~111 km × ~92 km, so stations tens of kilometres apart
  can share a curve. Don't mistake this for a caching bug in the app.

## Station data model

```js
{ id: "aB3xY9pQ",   // 8-char random string, generated client-side
  name: "Bouznika",
  latitude: 33.88,
  longitude: -7.04 }
```

Stored under the localStorage key `serialized_stations`. Any rewrite deployed to the same
origin should **migrate this key** so existing users do not lose their stations.

Other localStorage keys in use: `api_token` (legacy auth), `tides_*` (deployed tide cache).

## Known defects in `master`

Worth being aware of, and not worth fixing in the legacy code given the planned rewrite:

- `src/utils/local.js` — `create()` pushes to the list but never calls `LocalStorage.set`,
  so new stations are lost on reload.
- `src/router/routes.js` imports `layouts/FullScreen.vue` while the file is `Fullscreen.vue`
  — a case mismatch that breaks on case-sensitive filesystems.
- `src/components/user/Mini.vue` commits a `logout` mutation that does not exist in the store.
- `local.getList()` returns `null` when nothing is stored, and `List.vue` iterates it directly.
- The mapbox access token and style ID are hard-coded in `components/stations/map/Map.vue`.

## Planned stack

The agreed direction for the rewrite (details still being settled):

- **Vue 3 + Vite** SPA with TypeScript — not Nuxt (SSR/SSG/server routes bring no value here)
  and not React (the SVG graph is already Vue and is the bulk of the real logic).
- **Tailwind**-based component kit.
- **Leaflet** replaces mapbox-gl for location picking.
- **Offline-first**: tide payloads cached in IndexedDB, several days prefetched per station,
  stale-while-revalidate reads so navigation never blocks on the network.
- **PWA** installable on iOS and Android home screens, fully navigable offline.

Keep the graph maths (`utils/plot.js`) and the layered SVG structure; port rather than
reinvent them.
