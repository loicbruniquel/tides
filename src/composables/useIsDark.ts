import { onScopeDispose, readonly, ref } from 'vue'

/**
 * Whether the dark palette is currently applied.
 *
 * Watches the `.dark` class rather than the settings store, so it stays correct
 * whichever way the class was set — the pre-paint script in index.html, the settings
 * store, or an OS theme change while on "system".
 */
export function useIsDark() {
  const root = document.documentElement
  const isDark = ref(root.classList.contains('dark'))

  const observer = new MutationObserver(() => {
    isDark.value = root.classList.contains('dark')
  })
  observer.observe(root, { attributes: true, attributeFilter: ['class'] })

  onScopeDispose(() => observer.disconnect())

  return readonly(isDark)
}
