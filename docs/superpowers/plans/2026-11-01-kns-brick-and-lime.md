# KNS Brick & lime redesign: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the KNS website in the Brick & lime direction, piece by piece, as a client pitch that must look creative and work on any phone.

**Architecture:**
- Next.js 15 static export.
- One home page, `components/site/Site.tsx`, built from section components.
- Shared tokens in `tailwind.config.js`.
- Static HTML problem pages generated at build time.
- The 3D stack is deleted.
- New tokens sit beside the old navy and gold ones until the last section migrates (Task 9 removes the old ones), so the site never breaks between pieces.

**Tech stack:** Next.js 15, React 19, TypeScript 6, Tailwind 3.4, GSAP 3.15 (DrawSVG, ScrollTrigger) with @gsap/react, framer-motion 11, Lenis 1.3, and the React Bits Stepper. For tests: Playwright (global), axe-core at `/tmp/axe/node_modules/axe-core/axe.min.js`, and Hallmark sloplint.

**Spec:** `docs/superpowers/specs/2026-11-01-kns-brick-and-lime-redesign-design.md`

## Global constraints

- **Colours:** `lime #f3ede2`, `lime-deep #e8dfcf`, `brick #9c3d24`, `terracotta #c8693f`, `charcoal #23201d`, `soot #161412`, `gold #a58747` (logo and thin rules only). No literal colours in components; use tokens only. The SVG `stroke`/`fill` values in Intro and BuildStory use `currentColor` or the `--c-*` CSS variables.
- **Fonts:** Fraunces for display (`--font-display`), Hanken Grotesk for body (`--font-sans`), via a Google Fonts `<link>`. Body text is 16 px or more.
- **Copy:** no invented reviews, ratings, counts or awards. Design renders are always labelled "Design render, not a photo of a finished home". No labels in tracked capitals.
- **Layout and accessibility:**
  - `overflow-x: clip` on `html` and `body`.
  - Every control has `focus-visible`.
  - Every animation has a reduced-motion version.
  - Content is visible with JS off.
- **Phones (below 640 px):** the bottom bar with Call and WhatsApp is always visible and never covers content.
- **Budget:** the home page's first-load JS is 250 kB or less (shown in `next build` output).
- **Paths:** keep relative asset paths (no leading `/`). The artifact host serves from a sub-path.
- **Commits** end with the session attribution lines.

## Review focus

1. **Reload after the intro has played:** the intro must never paint (the `intro-seen` class is set before first paint). Covered by the Task 1 test `intro-hidden-on-reload`.
2. **Phone bottom bar covering the last content or the Stepper's Continue button:** the body needs bottom padding of at least the bar's height below 640 px. Covered by the Task 1 test `bottom-bar-no-overlap`.
3. **Visitor with reduced motion:**
   - no intro build;
   - the hero bricks are already laid;
   - BuildStory shows the full drawing and the list.
   Covered by `reduced-motion-content` in Tasks 1, 2 and 4.
4. **Text that can't be read:** any text pair below 4.5:1 contrast. Caught by axe on every piece.
5. **A dead link after deleting the 3D code** (`world/`, `house/`, footer "3D world preview"). Covered by the Task 1 test `no-3d-links`.

---

## Test harness, used by every task

One script, `tests/smoke.mjs`, run as `NODE_PATH=$(npm root -g) node tests/smoke.mjs` after `npm run build`.
- **What it does:**
  1. Copies `out/` to `/tmp/sub/kns`.
  2. Expects `python3 -m http.server 4500` running in `/tmp/sub`.
  3. For each viewport (390×844 phone, 1280×800 laptop), it opens `http://localhost:4500/kns/`, clicks Skip intro if present, scrolls to the bottom and back, then runs the shared checks:
     - no `pageerror` or console error;
     - `scrollWidth <= innerWidth`;
     - axe reports 0 violations.
  4. Runs each named check from the `CHECKS` object, saves screenshots to `/tmp/shots/<check>-<viewport>.png`, prints `PASS <name>` / `FAIL <name>: <reason>`, and exits non-zero on any failure.
- **Adding a check:** each task adds named checks to `CHECKS` as `name: async (page, vp) => { ... throw on failure }`.

---

### Task 1: Foundation, cleanup, header, bottom bar, intro recolour (piece 1)

**Files:**
- Create: `tests/smoke.mjs`, `components/site/BottomBar.tsx`
- Modify:
  - `tailwind.config.js` (add tokens);
  - `app/layout.tsx` (fonts link, `themeColor` `#161412`, metadata description without "3D");
  - `app/globals.css` (font variables, `overflow-x: clip`, `html` background `#f3ede2`, remove the `world-on` rules, `--c-*` variables);
  - `components/site/Site.tsx` (Header restyle, render `<BottomBar/>`, footer link removal);
  - `components/site/Intro.tsx` (recolour);
  - `package.json` (remove packages).
- Delete:
  - `app/world/`, `app/house/`;
  - `components/World.tsx`, `components/Experience.tsx`, `components/EntryFilm.tsx`, `components/scene/`, `components/house/`;
  - `lib/store.ts`, `lib/gpu.ts`, `lib/materials.ts`.

**Interfaces:**
- **Produces Tailwind colours:** `lime`, `lime-deep`, `brick`, `terracotta`, `charcoal`, `soot`, plus `gold` kept as is. `navy` and `stone` stay until Task 9.
- **Produces CSS variables:** `--c-brick`, `--c-terracotta`, `--c-lime`, `--c-charcoal`, `--c-gold`, `--font-display: 'Fraunces'`, `--font-sans: 'Hanken Grotesk'`.
- **Produces a component:** `BottomBar(): JSX`. It's fixed to the bottom and shown below `sm` only, with Call (`tel:${company.tel[0]}`) and WhatsApp (`wa('Hello KNS, I saw your website')`).

- [ ] **Step 1: Write `tests/smoke.mjs`** with the shared checks and these named checks:
  - `intro-hidden-on-reload`: after the intro finishes, `page.reload({waitUntil:'commit'})`, then poll every 50 ms for 1 s. `.intro` must never have computed `display` other than `none`.
  - `bottom-bar-no-overlap` (phone only): `[data-bottom-bar]` is visible. On scrolling to the bottom, the footer's last element's bottom is at most the bar's top.
  - `no-bottom-bar-laptop`: `[data-bottom-bar]` is not visible at 1280.
  - `no-3d-links`: no `a[href*="world"]` or `a[href*="house/"]` on the page.
  - `fonts`: `getComputedStyle(document.querySelector('h1')).fontFamily` includes `Fraunces`; body includes `Hanken Grotesk`.
  - `reduced-motion-content`: in a context with `reducedMotion: 'reduce'`, the h1 is visible (opacity 1) within 1.5 s of load.
- [ ] **Step 2: Run** `npm run build && NODE_PATH=$(npm root -g) node tests/smoke.mjs`. Expected: FAIL on `no-3d-links`, `fonts` and `bottom-bar-no-overlap`.
- [ ] **Step 3: Delete the 3D files and uninstall the packages.**
  - Delete the files listed above.
  - Run `npm uninstall three @types/three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing zustand`.
  - Remove the footer "3D world preview" link in `Site.tsx`.
  - Check that `grep -rn "world\|zustand\|three" app components lib` returns nothing relevant. `lib/content.ts` zone coordinates may stay; they're unused data.
- [ ] **Step 4: Tokens and fonts.**
  - Add the colours to `tailwind.config.js`.
  - Fonts link: `family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600`.
  - Set the variables in `globals.css`, and `html, body { overflow-x: clip }`.
- [ ] **Step 5: Header and BottomBar.**
  - Header: `bg-lime/90`, text `charcoal`, nav links `charcoal/80` with `hover:text-brick`, WhatsApp button `bg-brick text-lime hover:bg-terracotta`.
  - Header nav order: How we build, 3D designs, Our work, Prices, Projects, Visit (the anchors `#process #designs #home #packages #projects #visit`).
  - BottomBar: two equal buttons of at least 48 px height, Call `bg-charcoal text-lime`, WhatsApp `bg-brick text-lime`, with `pb-[env(safe-area-inset-bottom)]`.
  - Add `pb-20 sm:pb-0` to the page wrapper.
- [ ] **Step 6: Intro recolour.**
  - Curtain `bg-lime`. Crane and bricks use `var(--c-brick)`; K N S and the words use `var(--c-charcoal)`; the rule and tagline use `var(--c-gold)`.
  - The fly-out fades `backgroundColor` to `rgba(243,237,226,0)`.
  - Skip button `text-charcoal/75`.
  - Keep `timeScale(0.75)` and the sessionStorage logic unchanged.
- [ ] **Step 7: Run** `npm run build && node tests/smoke.mjs`. Expected: all PASS, and home first-load JS 250 kB or less.
- [ ] **Step 8: Sloplint and screenshots.**
  - Run `node /root/.claude/skills/hallmark/scripts/sloplint.mjs components/site/Intro.tsx components/site/BottomBar.tsx app/globals.css --render`. Expected: 0 FAIL.
  - Look at `/tmp/shots/*-phone.png` for the header, the bar and the intro frame.
- [ ] **Step 9: Commit** `feat: brick & lime foundation, remove 3D, phone bottom bar`, then publish to the artifact and show the user.

### Task 2: Hero with the brick wall (piece 2)
- **Files:** create `components/site/Hero.tsx` and move `Hero` out of `Site.tsx`; delete `components/bits/SplitText.tsx` and `TiltedCard.tsx` once unused.
- **Interfaces:** `Hero({ ready }: { ready: boolean })`. The bricks animate when `ready` becomes true.
- **Build:**
  - The real front-elevation photo framed by about 40 `.hero-brick` divs in offset courses.
  - GSAP stagger from `y: -20, opacity: 0`, about 1.5 s total, once.
  - Under reduced motion or with no JS, the bricks render laid.
  - Headline "Homes built brick by brick", the line "Turnkey G+1 houses in Hyderabad, materials included", the price "from ₹1,600 a sq ft" at display size, and two actions: WhatsApp (primary) and See prices.
- **Tests:**
  - `hero-above-fold`: at 1280×800 and 390×844, the h1, price and WhatsApp button are inside the viewport.
  - `hero-bricks-laid`: 2 s after `ready`, every `.hero-brick` has opacity 1.
  - `reduced-motion-content` extended to the bricks.

### Task 3: Our work (piece 3)
- **Build:**
  - Restyle `InsideHome` into the `#home` section in lime-deep.
  - A swipe row on phones (the `ROW`/`CELL` classes) and a 3-column grid on laptops.
  - Each photo has `data-slot="work-<n>"` for later replacement.
  - Delete `components/bits/AccordionGallery.tsx`.
- **Test** `work-row`: on phone the row's `scrollWidth > clientWidth`; on laptop it's a grid with no horizontal scroll.

### Task 4: How we build (piece 4)
- **Build:** recolour `BuildStory.tsx`: `bg-soot`, strokes `text-terracotta`, tick `bg-gold`, captions in lime.
- **Tests:**
  - `buildstory-draws`: scroll to 50% of the section; `.s3` paths have a non-zero `stroke-dashoffset` change, and the caption for stage 3 has opacity above 0.9.
  - `buildstory-reduced`: with reduced motion, all 5 `.cap` items are visible and `.render` is hidden.

### Task 5: See it in 3D (piece 5)
- **Build:** restyle `Designs` (already in `Site.tsx`) in the new tokens and keep the label copy word for word.
- **Test** `designs-labelled`: the text "Design render" is present in `#designs`.

### Task 6: Prices (piece 6)
- **Build:** brick cards for Standard ₹1,600–1,800, Premium ₹1,900–2,200 and Commercial ₹2,200–2,500, each with the line "3,000 sq ft comes to about ₹X to Y lakh" (computed by the existing `lakh()`), plus the included list and the estimate note.
- **Test** `prices`: the three ranges and "₹48 to 54 lakh", "₹57 to 66 lakh", "₹66 to 75 lakh" appear.

### Task 7: Projects and project pages (piece 7)
- **Build:** restyle the Projects cards (plain `img`, no tilt) and `app/projects/[slug]/page.tsx` in the new tokens.
- **Test** `project-pages`: each of the 4 project URLs returns 200, has an h1, and passes axe.

### Task 8: Find us on Google, Book a visit, footer (piece 8)
- **Build:**
  - New section `#google`. The button links to `https://www.google.com/maps/search/?api=1&query=KNS+Construction+and+Real+Estate+Kondapur` until the client supplies the profile URL. Comment: `shortcut: Maps search, swap for the Business Profile URL when KNS sends it`.
  - Restyle the Stepper and the footer.
- **Tests:**
  - `google-link`: the href contains `google.com/maps`.
  - `visit-flow`: choose Turnkey construction, then Continue, then a day, then a name; the final link's href starts `https://wa.me/919100425645`.

### Task 9: Problem pages, crash screens, final cleanup (piece 9)
- **Build:**
  - Rewrite the template in `scripts/make-error-pages.mjs` with the new tokens, an inline line drawing and the messages from the spec table.
  - Restyle `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` and `components/Resilience.tsx`.
  - Remove the `navy` and `stone` tokens and fix any leftover classes, which the build flags as missing styles. Check with `grep -rn "navy-\|stone-" app components` returning nothing.
- **Tests:**
  - `error-pages`: each `/errors/<code>.html` for 400, 401, 403, 404, 408, 429, 500, 502, 503, 504 and offline loads with JS disabled, shows its spec message, and has a Home link plus `tel:` and `wa.me` links.
  - `404-route`: `/kns/nope/` shows "This wall is missing a brick".
