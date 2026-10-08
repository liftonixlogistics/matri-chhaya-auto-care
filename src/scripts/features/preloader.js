import { prefersReducedMotion } from "../utils/dom.js";

/**
 * Opening screen shown while fonts and the hero image load.
 *
 * How it behaves:
 *  - Hides as soon as the page has finished loading.
 *  - Stays up for a minimum time so it never flashes on fast connections.
 *  - Gives up after a hard timeout so a slow image can never trap a visitor.
 *  - Markup and base styles are inline in index.html so it paints instantly.
 *
 * Timings live in src/config/animation.js (preloader* values).
 */
const MINIMUM_VISIBLE_MS = 900;
const HARD_TIMEOUT_MS = 6000;
const FADE_MS = 520;

export function initPreloader() {
  const screen = document.getElementById("preloader");
  if (!screen) return;

  const startedAt = performance.now();
  let finished = false;

  function hide() {
    if (finished) return;
    finished = true;

    document.documentElement.classList.remove("is-loading");
    screen.classList.add("is-done");
    screen.setAttribute("aria-hidden", "true");

    // Remove from the DOM once the fade finishes so it can never catch clicks.
    setTimeout(() => screen.remove(), prefersReducedMotion() ? 0 : FADE_MS);
  }

  function finish() {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, MINIMUM_VISIBLE_MS - elapsed);
    setTimeout(hide, prefersReducedMotion() ? 0 : remaining);
  }

  // Safety net: never hold the page hostage to a slow asset.
  setTimeout(hide, HARD_TIMEOUT_MS);

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
}
