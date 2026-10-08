# Editing Matri Chhaya without breaking the site

You can edit the website directly in GitHub's **main** branch. Vercel automatically deploys each commit.

## Change common things

| What to change | File |
| --- | --- |
| Business name, WhatsApp number | `src/config/shop.js` |
| Wheel smoke start (1.45 seconds) | `src/config/animation.js` -> `smokeStartMs` |
| Wheel turns orange (3 seconds) | `src/config/animation.js` -> `tyreHeatStartMs` |
| Scrolling orange bar speed | `src/config/animation.js` -> `marqueePixelsPerSecond` |
| Service list and the quote options | `src/data/services.js` |
| Main text, photo links, or section layout | `index.html` |
| Colours, fonts, general design | `src/styles/site.css` |
| Tablet and smartphone layout | `src/styles/responsive.css` |
| Wheel glow, smoke positioning, TOUCH styling | `src/styles/interactions.css` |
| Enquiry and WhatsApp behavior | `src/scripts/features/enquiry.js` |
| Wheel burnout behavior | `src/scripts/features/wheel-lab.js` |
| Smoke shape and particle animation | `src/scripts/features/wheel-smoke.js` |
| Swipe-to-clean interaction | `src/scripts/features/foam-wash.js` |
| Before/after slider | `src/scripts/features/before-after.js` |

## How to edit

1. Open the repository on GitHub, navigate to a file, and click the pencil icon.
2. Make one small change, then use **Commit changes**.
3. Wait for Vercel deployment to show **Ready**.
4. Open https://matri-chhaya-auto-care.vercel.app/ on your phone.
5. To undo a mistake, revert the commit in GitHub. Avoid overwriting multiple files from old copies.

## Common examples

### Add your WhatsApp number
Open `src/config/shop.js` and replace `whatsappNumber: ""` with your international number using digits only, such as `"91XXXXXXXXXX"`. Do **not** use a made-up phone number.

### Make wheel smoke start in one second
In `src/config/animation.js`, change `smokeStartMs: 1450` to `smokeStartMs: 1000`.

### Change a service name
Edit the relevant row in `src/data/services.js`. That changes both the Services list and enquiry options. If it's also written as a **static headline** in `index.html`, edit that headline too.

### Change photos
Image URLs are currently in `index.html` and in the `background-image` rule for the comparison in `src/styles/site.css`. Replace these with properly licensed photos, ideally compressed and reasonably sized.

## Important developer rules

- Do not edit the old `script.js` or `styles.css`; those files were replaced.
- Keep the CSS loading order: site.css → responsive.css → interactions.css.
- Keep all `id` attributes on interactive elements in `index.html`, as JavaScript uses them.
- `src/scripts/main.js` is the entry point. It initializes each feature once.
- Each `src/scripts/features/*.js` file owns its own feature; avoid adding unrelated logic.
- There is **no backend or database yet**. The quote builder prepares a WhatsApp message in the browser.
- **No npm install or build step is required.** The site is intentionally a lightweight static website.
- For local testing, use `python3 -m http.server 3000` and open `http://localhost:3000`; JavaScript modules do not run from `file://`.

## Performance checklist
Keep images compressed, avoid heavy video/3D dependencies, use transform for animations, and test on a real phone. For final launch, run a mobile Lighthouse test and address any issues.
