/**
 * Matri Chhaya — single entry point. No framework or bundler required.
 * Each feature lives in its own file for simple GitHub browser editing.
 */
import { initNavigation } from "./features/navigation.js";
import { initMarquee } from "./features/marquee.js";
import { initScrollReveal } from "./features/reveal.js";
import { initServiceFilter } from "./features/service-filter.js";
import { initFoamWash } from "./features/foam-wash.js";
import { initWheelLab } from "./features/wheel-lab.js";
import { initBeforeAfter } from "./features/before-after.js";
import { initEnquiry } from "./features/enquiry.js";

// This module is deferred until HTML parsing is complete by the browser.
initNavigation();
initMarquee();
initScrollReveal();
initServiceFilter();
initFoamWash();
initWheelLab();
initBeforeAfter();
initEnquiry();
