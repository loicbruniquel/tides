import { onScopeDispose, readonly, ref } from 'vue'

/**
 * Tracks connectivity.
 *
 * `navigator.onLine` only proves a network interface is up, not that the tide proxy is
 * reachable — it is used for the banner and nothing load-bearing.
 */
export function useOnline() {
  const online = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  const goOnline = () => (online.value = true)
  const goOffline = () => (online.value = false)

  window.addEventListener('online', goOnline)
  window.addEventListener('offline', goOffline)

  onScopeDispose(() => {
    window.removeEventListener('online', goOnline)
    window.removeEventListener('offline', goOffline)
  })

  return readonly(online)
}
