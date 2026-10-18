/**
 * "Site ready" signalling.
 *
 * The page curtain (intro loader + route transitions) covers the site while it
 * is up. Pages register their entrance animation with `onSiteReady`, and it is
 * fired the moment the curtain starts lifting - so the hero lockup animates in
 * *as* the curtain leaves instead of playing out of sight underneath it.
 */
export const READY_EVENT = 'pyro:ready';

export function onSiteReady(cb: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  if (document.documentElement.dataset.siteReady === 'true') {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(READY_EVENT, handler, { once: true });
  return () => window.removeEventListener(READY_EVENT, handler);
}

export function setSiteReady(ready: boolean) {
  document.documentElement.dataset.siteReady = String(ready);
  if (ready) window.dispatchEvent(new Event(READY_EVENT));
}

/** Slow exponential ease used for programmatic scrolling (matches GSAP's expo.out). */
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
