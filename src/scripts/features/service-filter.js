import { SERVICES } from "../../data/services.js";
import { get } from "../utils/dom.js";

/** Builds the service list using the single source of truth in data/services.js. */
export function initServiceFilter() {
  const list = get("service-rows");
  const filters = document.querySelectorAll("[data-filter]");

  function render(category) {
    list.replaceChildren();

    for (const [number, title, group] of SERVICES) {
      if (category !== "ALL" && group !== category) continue;

      const row = document.createElement("a");
      row.className = "service-row";
      row.href = "#quote";

      const label = (className, value, tag = "span") => {
        const node = document.createElement(tag);
        node.className = className;
        node.textContent = value;
        return node;
      };

      row.append(
        label("number", number),
        label("", title, "strong"),
        label("group", group),
        label("arrow", "↗"),
      );
      list.append(row);
    }
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      render(button.dataset.filter);
    });
  });

  render("ALL");
}
