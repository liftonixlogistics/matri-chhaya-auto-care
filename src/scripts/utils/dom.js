/** Small DOM helpers shared by feature modules. */
export function get(id) {
  return document.getElementById(id);
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
