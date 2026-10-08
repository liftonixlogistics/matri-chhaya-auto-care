# मातृ छाया — Matri Chhaya Auto Care

A premium, mobile-first car-care website with original comic-style interactions.

**Live site:** https://matri-chhaya-auto-care.vercel.app/

## Project status

The website currently has **no backend**. It is a static site using plain HTML, CSS, and native JavaScript modules. Enquiries are prepared client-side for copying or sharing to WhatsApp. No customer information is stored.

This keeps loading fast, the monthly hosting simple, and the code easy to edit without framework expertise.

## Folder layout

```text
index.html                     # Page layout, labels, photos
src/
  config/
    shop.js                     # Real shop details / WhatsApp destination
    animation.js                # Adjustable animation timing & limits
  data/
    services.js                 # The 9 services and wheel-service copy
  scripts/
    main.js                     # Initializes every feature
    utils/
      dom.js                    # Small reusable DOM helpers
    features/
      navigation.js             # Full-screen menu
      marquee.js                # Touch-and-flick orange ticker
      reveal.js                 # Scroll reveal
      service-filter.js         # Service categories
      foam-wash.js              # Swipe-away dirt demo
      wheel-lab.js              # Burnout acceleration and tyre heat
      wheel-smoke.js            # One-sided cartoon smoke particle engine
      before-after.js           # Comparison slider
      enquiry.js                # Service selections & WhatsApp draft
  styles/
    site.css                    # Base styles and design tokens
    responsive.css              # Tablet and smartphone layout
    interactions.css            # Touch controls, heat glow and smoke visuals
docs/
  EDITING_GUIDE.md              # Where to edit things
```

## Editing

**Start with [docs/EDITING_GUIDE.md](docs/EDITING_GUIDE.md).**
Each feature is isolated to reduce accidental changes. Edit files directly in GitHub; Vercel deploys on push to `main`.

## Development

No package manager, external framework, or build tool is needed.

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000/ in a web browser.

## Remaining shop information

Shop phone, WhatsApp, address, opening times, actual work photos and before/after examples, rates and CEAT inventory need real data before launch. Illustrative demo visuals are labeled. Never invent contact information or customer results.

## Source inspiration

Design direction inspired by ownitt.fr (original code). Photos currently use Unsplash links where permitted under the Unsplash license.
