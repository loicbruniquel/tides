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
 * A shared clock in unix seconds.
 *
 * Reading `Date.now()` once during `setup` leaves "next high water" frozen at whatever
 * it was when the component mounted — which is wrong the moment a home-screen PWA is
 * resumed hours later, since iOS restores the page rather than reloading it. Hence the
 * `visibilitychange` tick alongside the interval.
 */
export function useNow() {
  if (subscribers === 0) {
    tick()
    timer = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
  }
  subscribers += 1

  onScopeDispose(() => {
    subscribers -= 1
    if (subscribers > 0) return

    clearInterval(timer)
    timer = undefined
    document.removeEventListener('visibilitychange', tick)
  })

  return readonly(nowSeconds)
}
