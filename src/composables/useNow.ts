import { onScopeDispose, readonly, ref } from 'vue'

/** How often the shared clock advances. A tide readout only needs minute resolution. */
const TICK_MS = 30_000

const nowSeconds = ref(Date.now() / 1000)
let subscribers = 0
let timer: ReturnType<typeof setInterval> | undefined

function tick() {
  nowSeconds.value = Date.now() / 1000
}

/**
 * A shared clock in unix seconds. Every "now" in the app must come from here.
 *
 * Reading `Date.now()` once during `setup` leaves "next high water" frozen at whatever
 * it was when the component mounted — which is wrong the moment a home-screen PWA is
 * resumed hours later, since iOS restores the page rather than reloading it. A private
 * `setInterval` is no better: a backgrounded page's timers are throttled or frozen
 * outright, so the first thing a resumed page needs is a tick, not a countdown.
 *
 * Hence three resume signals alongside the interval:
 *  - `visibilitychange` — tab switches and app-switcher returns,
 *  - `pageshow` — a restore from the back/forward cache, which fires no
 *    `visibilitychange` at all,
 *  - `focus` — a desktop window regaining focus while never having been hidden.
 *
 * `tick` is idempotent, so several of them firing together is free.
 */
export function useNow() {
  if (subscribers === 0) {
    tick()
    timer = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('pageshow', tick)
    window.addEventListener('focus', tick)
  }
  subscribers += 1

  onScopeDispose(() => {
    subscribers -= 1
    if (subscribers > 0) return

    clearInterval(timer)
    timer = undefined
    document.removeEventListener('visibilitychange', tick)
    window.removeEventListener('pageshow', tick)
    window.removeEventListener('focus', tick)
  })

  return readonly(nowSeconds)
}
