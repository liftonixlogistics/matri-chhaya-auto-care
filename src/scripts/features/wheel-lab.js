import { ANIMATION } from "../../config/animation.js";
import { WHEEL_SERVICES } from "../../data/services.js";
import { get } from "../utils/dom.js";
import { createTyreSmoke } from "./wheel-smoke.js";

/** Tap-and-hold burnout wheel: stops immediately on release. */
export function initWheelLab() {
  const button = get("spin-wheel");
  const scene = get("wheel-scene");
  const tyre = button.querySelector(".wheel-tyre");

  let angle = 17;
  let holding = false;
  let activePointer = null;
  let startedAt = 0;
  let previousFrame = 0;
  let frameId = 0;
  let brakeTimer = 0;

  const smoke = createTyreSmoke(
    button,
    scene,
    get("tyre-smoke"),
    () => startedAt,
  );

  function frame(now) {
    if (!holding) return;

    const elapsed = now - startedAt;
    const dt = Math.min((now - previousFrame) / 1000, 0.05);
    previousFrame = now;

    const speed = Math.min(
      ANIMATION.maxWheelDegreesPerSecond,
      120 + (elapsed / 1000) * 230,
    );
    angle = (angle + speed * dt) % 360;
    tyre.style.transform = `rotate(${angle.toFixed(2)}deg)`;

    if (elapsed >= ANIMATION.smokeStartMs) smoke.start();
    if (elapsed >= ANIMATION.tyreHeatStartMs) scene.classList.add("is-hot");

    frameId = requestAnimationFrame(frame);
  }

  function start() {
    if (holding) return;

    clearTimeout(brakeTimer);
    scene.classList.remove("is-braking");
    scene.classList.add("is-spinning");
    holding = true;
    startedAt = performance.now();
    previousFrame = startedAt;
    frameId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!holding) return;

    holding = false;
    cancelAnimationFrame(frameId);
    smoke.stop();
    scene.classList.remove("is-spinning", "is-hot");
    scene.classList.add("is-braking");

    brakeTimer = setTimeout(() => {
      scene.classList.remove("is-braking");
    }, 1150);
  }

  function releasePointer(event) {
    if (activePointer !== event.pointerId) return;
    activePointer = null;
    stop();
  }

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (activePointer !== null) return;

    activePointer = event.pointerId;
    button.setPointerCapture(event.pointerId);
    start();
  });
  button.addEventListener("pointerup", releasePointer);
  button.addEventListener("pointercancel", releasePointer);
  button.addEventListener("lostpointercapture", releasePointer);

  // Keyboard users can also press and hold Space / Enter.
  button.addEventListener("keydown", (event) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      start();
    }
  });
  button.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      stop();
    }
  });

  button.addEventListener("blur", stop);
  window.addEventListener("blur", stop);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });

  const tabs = document.querySelectorAll("[data-mode]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const index = Number(tab.dataset.mode);
      tabs.forEach((candidate) => {
        const active = candidate === tab;
        candidate.classList.toggle("selected", active);
        candidate.setAttribute("aria-pressed", String(active));
      });

      get("wheel-counter").textContent =
        `YOUR SELECTED SERVICE / 0${index + 1}`;
      get("wheel-name").textContent = WHEEL_SERVICES[index][0];
      get("wheel-copy").textContent = WHEEL_SERVICES[index][1];
    });
  });
}
