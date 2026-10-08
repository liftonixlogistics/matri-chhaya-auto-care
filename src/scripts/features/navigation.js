import { get } from "../utils/dom.js";

/** Controls the fullscreen menu and Escape-key dismissal. */
export function initNavigation() {
  const menu = get("menu");
  const toggle = get("menu-button");

  function close() {
    menu.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
  }

  toggle.addEventListener("click", () => {
    if (menu.classList.contains("open")) {
      close();
      return;
    }

    menu.classList.add("open");
    toggle.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
