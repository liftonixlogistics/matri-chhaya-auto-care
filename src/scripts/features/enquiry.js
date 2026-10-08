import { SHOP } from "../../config/shop.js";
import { SERVICES } from "../../data/services.js";
import { get } from "../utils/dom.js";

/**
 * No backend needed yet: customers select services and copy/share a message.
 * To receive WhatsApp messages directly, set SHOP.whatsappNumber in config/shop.js.
 */
export function initEnquiry() {
  const selected = new Set();
  const options = get("quote-options");
  const vehicle = get("vehicle");
  const count = get("selection-count");
  const whatsapp = get("whatsapp-share");
  const copyButton = get("copy-quote");

  function makeMessage() {
    const services = selected.size ? [...selected].join(", ") : "Please advise";
    return [
      "Hello Matri Chhaya! I would like an enquiry.",
      `Vehicle: ${vehicle.value}`,
      `Services: ${services}`,
      "Please share pricing and availability.",
    ].join("\n");
  }

  function updateWhatsApp() {
    const phone = SHOP.whatsappNumber.replace(/\D/g, "");
    const number = phone ? `phone=${phone}&` : "";
    whatsapp.href = `https://api.whatsapp.com/send?${number}text=${encodeURIComponent(makeMessage())}`;
  }

  for (const [, serviceName] of SERVICES) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");

    const icon = document.createElement("span");
    icon.textContent = "+";
    button.append(icon, document.createTextNode(serviceName));

    button.addEventListener("click", () => {
      if (selected.has(serviceName)) selected.delete(serviceName);
      else selected.add(serviceName);

      const active = selected.has(serviceName);
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
      icon.textContent = active ? "✓" : "+";

      count.textContent = selected.size
        ? `${selected.size} service${selected.size > 1 ? "s" : ""}`
        : "No services selected yet";

      updateWhatsApp();
    });

    options.append(button);
  }

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(makeMessage());
      copyButton.textContent = "COPIED ✓";
      setTimeout(() => { copyButton.textContent = "COPY ENQUIRY ↗"; }, 2500);
    } catch {
      window.prompt("Copy enquiry text:", makeMessage());
    }
  });

  vehicle.addEventListener("change", updateWhatsApp);
  updateWhatsApp();
}
