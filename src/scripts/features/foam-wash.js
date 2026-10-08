import { get } from "../utils/dom.js";

/**
 * Swipe-away car wash: a lightweight Canvas 2D dirt overlay.
 * The original car image remains underneath in the HTML.
 */
export function initFoamWash() {
  const canvas = get("wash-canvas");
  const ctx = canvas.getContext("2d");
  const status = get("wash-status");
  const action = get("wash-reveal");

  if (!ctx) return;

  let activePointer = null;
  let previousPoint = null;
  let swipeCount = 0;
  let isClean = false;

  function reset() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * pixelRatio);
    canvas.height = Math.round(bounds.height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, bounds.width, bounds.height);

    ctx.fillStyle = "rgba(43, 40, 32, .76)";
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    // Seeded noise keeps the dirt pattern consistent across redraws.
    let seed = 32021;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 130; i++) {
      ctx.beginPath();
      ctx.fillStyle = i % 2 === 0
        ? "rgba(204, 189, 150, .13)"
        : "rgba(5, 5, 5, .11)";
      ctx.arc(
        random() * bounds.width,
        random() * bounds.height,
        5 + random() * 32,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    isClean = false;
    swipeCount = 0;
    previousPoint = null;
    status.textContent = "● SWIPE TO CLEAN";
    action.textContent = "REVEAL FINISH ↗";
  }

  function erase(event) {
    if (isClean) return;

    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = Math.max(54, bounds.width * 0.125);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(previousPoint?.x ?? x, previousPoint?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    previousPoint = { x, y };
    swipeCount += 1;
    if (swipeCount > 8) status.textContent = "● KEEP GOING!";
  }

  canvas.addEventListener("pointerdown", (event) => {
    activePointer = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    erase(event);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (activePointer === event.pointerId) erase(event);
  });

  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    canvas.addEventListener(type, () => {
      activePointer = null;
      previousPoint = null;
    });
  }

  action.addEventListener("click", () => {
    if (isClean) {
      reset();
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isClean = true;
    status.textContent = "● SHOWROOM READY";
    action.textContent = "TRY AGAIN ↻";
  });

  new ResizeObserver(reset).observe(canvas);
  reset();
}
