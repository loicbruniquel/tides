/**
 * Blocks pinch-to-zoom on iOS Safari.
 *
 * `user-scalable=no` and `maximum-scale=1` in the viewport meta cover Android and an
 * iOS standalone install, but iOS Safari has ignored both since iOS 10. Its
 * non-standard `gesture*` events are the only remaining hook.
 *
 * Double-tap zoom is handled separately, by `touch-action: manipulation` on the body
 * in assets/main.css.
 *
 * Deliberately not also listening for multi-touch `touchmove`: a non-passive touchmove
 * listener on the document costs scroll performance on every single scroll, and the
 * gesture events already cover the only browser that needs it.
 *
 * Leaflet drives its own pinch zoom from touchstart/touchmove rather than these
 * events, so the map still zooms normally.
 */
export function preventPinchZoom(): void {
  const block = (event: Event) => event.preventDefault()

  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, block, { passive: false })
  }
}
