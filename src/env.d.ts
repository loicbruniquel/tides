/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/vue" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// tz-lookup ships no type declarations of its own.
declare module 'tz-lookup' {
  /** Returns the IANA timezone name for a coordinate, e.g. "Africa/Casablanca". */
  export default function tzlookup(latitude: number, longitude: number): string
}

/** Injected by the `define` in vite.config.ts, straight from package.json. */
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_TIDES_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
