import { get } from "../utils/dom.js";

/** Illustrative comparison slider — drag works on mobile and desktop. */
export function initBeforeAfter() {
  const slider = get("compare-input");
  const after = get("compare-after");
  const dividingLine = get("compare-bar");

  function update() {
    const value = Number(slider.value);
    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    dividingLine.style.left = `${value}%`;
  }

  slider.addEventListener("input", update);
  update();
}
