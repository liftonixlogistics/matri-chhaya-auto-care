import { ANIMATION } from "../../config/animation.js";
import { get, prefersReducedMotion } from "../utils/dom.js";

/**
 * The orange service ticker scrolls by itself.
 * Touch: hold to pause, drag in either direction, flick for inertia.
 * Keep touch-action: pan-y in CSS so normal page scrolling still works.
 */
export function initMarquee() {
  const ticker = get("draggable-ticker");
  const track = ticker.querySelector(".ticker-inner");
  const firstCopy = track.firstElementChild;

  let loopWidth = 1;
  let offset = 0;
  let activePointer = null;
  let lastX = 0;
  let lastMoveAt = 0;
  let fingerVelocity = 0;
  let momentum = 0;
  let previousFrame = performance.now();

  function measure() {
    loopWidth = Math.max(1, firstCopy.getBoundingClientRect().width);
  }

  function draw() {
    offset = ((offset % loopWidth) + loopWidth) % loopWidth;
    if (offset > 0) offset -= loopWidth;
    track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
  }

  function animate(now) {
    const dt = Math.min((now - previousFrame) / 1000, 0.05);
    previousFrame = now;

    if (activePointer === null && !prefersReducedMotion()) {
      if (Math.abs(momentum) > 28) {
        offset += momentum * dt;
        momentum *= Math.exp(-3.8 * dt);
      } else {
        momentum = 0;
        offset -= ANIMATION.marqueePixelsPerSecond * dt;
      }
      draw();
    }

    requestAnimationFrame(animate);
  }

  function release(event, cancelled = false) {
    if (activePointer !== event.pointerId) return;

    activePointer = null;
    ticker.classList.remove("is-dragging");

    const recent = performance.now() - lastMoveAt < 100;
    momentum = !cancelled && recent
      ? Math.max(-2100, Math.min(2100, fingerVelocity * 1000))
      : 0;
  }

  ticker.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    activePointer = event.pointerId;
    lastX = event.clientX;
    lastMoveAt = performance.now();
    fingerVelocity = 0;
    momentum = 0;
    ticker.classList.add("is-dragging");
    ticker.setPointerCapture(event.pointerId);
  });

  ticker.addEventListener("pointermove", (event) => {
    if (activePointer !== event.pointerId) return;

    const now = performance.now();
    const dx = event.clientX - lastX;
    const dt = Math.max(1, now - lastMoveAt);
    offset += dx;
    fingerVelocity = fingerVelocity * 0.3 + (dx / dt) * 0.7;
    lastX = event.clientX;
    lastMoveAt = now;
    draw();
  });

  ticker.addEventListener("pointerup", (event) => release(event));
  ticker.addEventListener("pointercancel", (event) => release(event, true));
  ticker.addEventListener("lostpointercapture", (event) => release(event, true));

  window.addEventListener("resize", measure, { passive: true });
  document.fonts?.ready.then(measure);

  measure();
  requestAnimationFrame(animate);
}
