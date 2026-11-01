# KNS website redesign: Brick & lime

Date: 2026-11-01. Status: approved in conversation (parts 1 and 2), awaiting review of this document.

## Goal

Replace the current navy-and-gold site with a creative, phone-first website for KNS Construction and Real Estate (Kondapur, Hyderabad) that turns visitors from WhatsApp and Google into calls, WhatsApp messages and site visits.

Success means:
- A first-time visitor on a mid-range Android phone sees proof of real work, the price and a way to call within the first two screens.
- It does not look like a template builder site.
- It works with no graphics card, on slow 4G and with animations turned off.

## Decisions already made

- The 3D open world (`/world`) and the 3D house page (`/house`) are removed. "3D" means the 3D design renders, shown as a section.
- Direction: Brick & lime. The logo and the logo intro animation stay.
- Build the whole site now with the photos we have. Every photo sits in a named slot, so the client's Google and Justdial photos replace them later without layout changes.
- Nothing is invented: no reviews, ratings, client counts or awards unless KNS supplies them.

## Pages

| Route | Content |
|---|---|
| `/` | Home, nine sections (below) |
| `/projects/<slug>/` | Four pages: `kondapur-duplex`, `raghavendra-colony-apartments`, `ganapatiguda-villas`, `open-plots`. Photos, facts, status, map link, WhatsApp |
| `/errors/*.html`, `/404.html`, `/offline.html` | Problem pages (below) |
| `app/error.tsx`, `app/global-error.tsx` | Crash screens with Reload |

Deleted: `app/world`, `app/house`, `components/World.tsx`, `components/Experience.tsx`, `components/EntryFilm.tsx`, `components/scene/*`, `components/house/*`, `lib/store.ts`, `lib/gpu.ts`, `lib/materials.ts`. three.js, react-three-fiber, drei and postprocessing are uninstalled.

## Home page, in order

1. **Logo intro.** The existing GSAP crane, bricks and K-N-S build, recoloured to brick on cream. It plays once per browser session and hides before first paint on reload (the `intro-seen` class). It's 25% slower than before (`timeScale(0.75)`), has a Skip button, and fades simply under reduced motion.
2. **Hero.**
   - Headline "Homes built brick by brick", one line "Turnkey G+1 houses in Hyderabad, materials included" and the price "from ₹1,600 a sq ft" set large.
   - Actions: WhatsApp (primary) and See prices.
   - The real front-elevation photo sits inside a brick wall of about 40 bricks that lays itself once (about 1.5 s, GSAP stagger).
3. **Our work.** Real finished-home photos (`photos/real/*`) in a swipe row on phones and a grid on wider screens, with captions. Slots are named for replacement.
4. **How we build.** `components/site/BuildStory.tsx` (already written): a G+1 line drawing scrubbed through five stages as you scroll, ending on `photos/design/exterior.jpg`. It's recoloured to terracotta on soot. With no JS or reduced motion, it shows the finished drawing plus the five stages as a list.
5. **See it in 3D.** The four design renders, labelled "Design renders, not photos of finished homes", with an "Ask for a 3D design" WhatsApp action.
6. **Prices.**
   - Standard ₹1,600–1,800, Premium ₹1,900–2,200, Commercial ₹2,200–2,500 a sq ft, as stacked brick cards, each with a "3,000 sq ft comes to about ₹X–Y lakh" line.
   - The included-scope list below them.
   - The note "Prices are estimates and vary with design, location and specifications."
7. **Projects.** Four cards (photo, name, status, one line, Details and WhatsApp). The existing note on artist's impressions and TS-RERA stays.
8. **Find us on Google.** Buttons to the Google Business Profile (reviews and directions) and Google Maps. Real reviews are added only when supplied. The listing URL is needed from the client; until then the button opens a Maps search for "KNS Construction and Real Estate Kondapur".
9. **Book a site visit and footer.** The existing three-step Stepper that opens a pre-filled WhatsApp message. The footer has the logo, proprietor, address, both phones, email and directions.

Persistent controls:
- Header: logo, section links on laptop, and a WhatsApp button. It hides while scrolling down and returns on scroll up.
- Phones (below 640 px): a fixed bottom bar with Call and WhatsApp. The page gets bottom padding so the bar never covers content.

## Look

Tokens live in `tailwind.config.js` (colours, fonts) and are the only source of colour and type.

| Token | Value | Use |
|---|---|---|
| `lime` | `#f3ede2` | page background |
| `lime-deep` | `#e8dfcf` | cards, alternate bands |
| `brick` | `#9c3d24` | primary buttons, accents |
| `terracotta` | `#c8693f` | hover, line drawings |
| `charcoal` | `#23201d` | text |
| `soot` | `#161412` | dark sections, footer |
| `gold` | `#a58747` | logo and thin rules only |

- **Type:** Fraunces for display and Hanken Grotesk for body, via Google Fonts `<link>`. Body text is 16 px or more. Labels are in sentence case, never tracked capitals.
- **Texture:**
  - A faint plaster grain on `lime` backgrounds, from an inline SVG noise image at low opacity.
  - Section dividers made of brick-course lines (offset rows), drawn in CSS.
- **Contrast:** every text and background pair meets WCAG AA. Brick on lime is about 6:1.

## Motion

Only these moves:
- the intro;
- the hero brick wall;
- the BuildStory scrub;
- one shared section reveal (framer-motion, rise 24 px with fade, once);
- buttons pressing down 1 px when tapped.

Lenis smooth scroll runs only on pointer-fine devices (laptops). Every animation has a reduced-motion version, and content is visible with scripting off.

## Libraries

- **Kept:** Next.js 15 static export, Tailwind 3, GSAP (DrawSVG, ScrollTrigger), @gsap/react, framer-motion, Lenis, the React Bits Stepper.
- **Removed:** the React Bits TiltedCard and AccordionGallery, the React Bits SplitText (the hero headline uses the shared reveal) and all three.js packages.

## Problem pages

These are static HTML generated by `scripts/make-error-pages.mjs` in the same tokens. Each has a small inline line drawing, one sentence, a Home link, and Call and WhatsApp buttons. They work with no JS.

| Code | Message |
|---|---|
| 404 | This wall is missing a brick. |
| offline | No signal on site. Your request will work once you are back online. |
| 500, 502, 503, 504 | Under construction, back shortly. (idle crane drawing) |
| 401, 403 | Site entry restricted. |
| 429 | Slow down, the cement is still setting. |
| 400, 408 | That request did not hold. Please try again. |

The service worker (`public/sw.js`) keeps serving `offline.html` when the network is down. The hosting configs (`netlify.toml`, `vercel.json`, `public/.htaccess`) keep their error mappings.

## Build order (one piece at a time, each shown to the user before the next)

1. Tokens, fonts, removal of the 3D code and packages, header, phone bottom bar, intro recolour.
2. Hero with the brick wall.
3. Our work.
4. How we build (BuildStory recolour and test).
5. See it in 3D.
6. Prices.
7. Projects and the four project pages.
8. Find us on Google, book a visit, footer.
9. Problem pages and crash screens.

## Testing, for every piece

- `npm run build` passes, with types checked.
- Playwright at 390×844 (phone) and 1280×800 (laptop):
  - screenshots;
  - no horizontal overflow;
  - no console errors;
  - axe-core reports zero violations.
- The reduced-motion and no-JS renders show all content.
- Hallmark sloplint reports zero FAIL on changed files.
- Published to the artifact for the user to check on a real phone.

## Out of scope

- Telugu language.
- A blog.
- A CMS.
- Online payments.
- Pulling photos from Justdial or Google automatically. Those hosts are blocked in this session, so the client sends files instead.

## Risks

- The design renders are AI-generated, so they're always labelled as designs.
- The real photos are 573 px until originals arrive.
- The project lives only in this temporary container until it is pushed to a git remote.
