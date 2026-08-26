# Tides

Tide graphs and times for any coastal location. An offline-first PWA: open a station and
it downloads the next few days, so the app stays usable with no connection at all.

Live at <https://tides.mauvaisgout.net>.

## Stack

Vue 3 + Vite (SPA, TypeScript) · Tailwind v4 · [Reka UI](https://reka-ui.com) primitives ·
[Phosphor](https://phosphoricons.com) icons · Pinia · TanStack Query persisted to
IndexedDB · Leaflet · `vite-plugin-pwa`.

There is no SSR and no SEO requirement — see `docs/MIGRATION_PLAN.md` for why the stack
looks like this.

## Getting started

Requires Node 20.19+ (or 22.12+).

```bash
npm install
npm run dev        # http://localhost:8481
```

## Commands

```bash
npm run dev        # dev server
npm run build      # type-check then build to dist/
npm run preview    # serve the production build (needed to exercise the service worker)
npm run check      # vue-tsc + eslint
npm run lint       # eslint --fix
npm run test       # vitest
```

The service worker is not active in `dev`; use `npm run build && npm run preview` to test
installation and offline behaviour.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_TIDES_API` | `https://tidesproxy.mauvaisgout.net` | Tide proxy base URL |

The proxy reflects any `Origin`, so no dev proxy is needed.

## How offline works

- Tide payloads live in **IndexedDB**, via a persisted TanStack Query cache. Opening a
  station prefetches N days ahead (5 by default, configurable in Settings).
- The station list lives in **localStorage** — it is tiny, and reading it synchronously at
  boot avoids an empty-list flash.
- The cache is rehydrated *before* the app mounts, so an offline launch renders data
  rather than an empty screen.
- Workbox precaches the app shell and falls back to `index.html`, so deep links work
  offline. Map tiles get their own small `CacheFirst` cache. Tide responses are
  deliberately **not** cached by Workbox — IndexedDB is their single source of truth.

## Notes

- All times are rendered in the **station's** timezone, not the device's. The API returns
  the station's local day stamped in UTC, so anything else shifts every high and low when
  you look at a station abroad.
- The API rounds coordinates to the nearest whole degree. That is by design on its side;
  the app stores precise coordinates and lets the API do the rounding.
- See `CLAUDE.md` for the tide graph's coordinate system, which is deliberately inverted.
