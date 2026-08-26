/**
 * Thin, total wrappers over localStorage.
 *
 * Safari in private mode and browsers with site data disabled throw on access rather
 * than returning null, so every call site would otherwise need its own try/catch.
 */

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled — the in-memory state is still correct.
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignored, as above
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignored, as above
  }
}

/** Every localStorage key currently set, or an empty list if storage is unreadable. */
export function allKeys(): string[] {
  try {
    return Object.keys(localStorage)
  } catch {
    return []
  }
}
