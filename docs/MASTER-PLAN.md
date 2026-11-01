# KNS 3D World: master plan (v3)

Status: plan for approval. Nothing below is built yet unless marked **(exists)**.

---

## 1. Strategy in one page

**Business outcome:** more site visits and more serious enquiries for KNS.
**North Star metric:** WhatsApp enquiries a week that start from the website (every button pre-fills "Seen on the KNS website: <section>", so KNS can count them in WhatsApp itself).

**The buyer's job (JTBD):** *"When I decide where to buy a plot or build a house in Hyderabad, help me trust a builder enough to go and see a site."*

| Force | What the buyer feels | What the site must do |
|---|---|---|
| Push | Builders hide costs; I can't picture the result | Show the price and the house together, live |
| Pull | See my house before it exists | Let them design it and watch it rise |
| Anxiety | Is KNS real? Approvals? Quality? Hidden extras? | Real projects, RERA numbers, materials named, proprietor's face |
| Habit | I'll just ask a relative or a broker | Make sharing the site on WhatsApp the easy next step |

**Story the site tells (peak-end rule):**
Exposition: the logo builds itself → Inciting: "What do you want: a plot, a house built, a ready home?" (asked by the world, not by a pop-up) → Rising: explore → **Peak: your own house rises with your choices and its price** → **End: the KNS office, Kiran Gajbhare welcomes you, book a visit.**

---

## 2. What changes from today

| Remove | Why |
|---|---|
| Walk mode **(already removed)** | Clients didn't want it |
| "Open the gate" button | Clients don't want to be asked. The entry plays by itself |
| Calculator pop-ups (estimate, EMI) | Feel like forms. The price moves into the house designer, where it's an experience |
| Grey HUD buttons on the right | Replaced by in-world signposts and one slim bar |

---

## 3. Every section, what the visitor sees and does

Each section is a **place in the 3D world**, has its **own link** (for WhatsApp sharing and Google), and a **plain page version** for slow phones.

### 0. Entry film: `/` (8 to 10 seconds, plays by itself)
1. Navy screen. Thin gold lines draw the **crane from the KNS logo**.
2. The jib swings; the hook lowers and **lifts the letters K, N, S into place**.
3. Gold **bricks stack** one by one beside them and the tagline writes in: *Building dreams, brick by brick*.
4. The camera pulls back: the finished logo **is the sign on the gate**. The gates **swing open on their own**, and the camera glides in at golden hour.
- A small "Skip" link for return visitors (remembered on their phone). Reduced motion: the logo fades in and the world appears.
- No button, no question.

### 1. Welcome drive: `/#welcome`
- The camera settles on the main drive. Three **gold signposts** stand in the world: **Buy a plot**, **Build my house**, **Buy a ready home**. Tapping one flies you there.
- A slim bottom bar: **Play tour**, sections, **WhatsApp**. Nothing else on screen.
- **Play tour:** a 90-second film through every section with captions and chapter dots. Touching the screen hands control back.

### 2. Our projects: `/projects` and `/projects/<name>`
- A **3D map table** of west Hyderabad: Kondapur, Raghavendra Colony, Patancheru. **Pins rise** for each KNS project.
- Tap a pin → the project page: photos, a status badge (**Completed / Ready to move / Under construction / Concept**, set by KNS), key facts, **Directions** (Google Maps), **Share on WhatsApp**, **Ask about this project**.
- Known today: Kondapur duplex, Raghavendra Colony apartments, Ganapatiguda villa community, open plots. **Completed projects KNS has built are the most important missing content** (see § 5).

### 3. Build my house: `/#build` (the peak)
- **Design your home:** choose the plot (150, 200 or 300 sq yd), the floors (G+1 or G+2), the package (Standard or Premium) and the facing.
- The **3D house reshapes live**. Premium gets stone cladding, timber, glass railings and facade lights; Standard gets painted plaster.
- A **gold price tag floats above the house** and updates as you choose, using KNS's real rates.
- **Watch it build:** your house rises stage by stage (footings, frame, walls, services, finish). Each stage names what's included (TMT steel, red brick, CPVC piping…).
- Ending: **Send my design to KNS** (WhatsApp with the full spec and price) and **Share my design** (a link that rebuilds the same house).

### 4. Finishes studio: `/#finishes`
- Step inside a cut-open room. **Tap swatches on the wall** to change the vitrified floor tiles, granite platform, wall colour and main door, and the room changes instantly.
- Your picks are **added to your house design** and travel with it to WhatsApp.

### 5. Ready-to-move duplex, Kondapur: `/projects/kondapur-duplex`
- **Sun path:** drag the sun from morning to evening and watch light fall on the east-facing front. This shows why east facing and Vastu matter, instead of just claiming it.
- **Lift the roof:** the roof and first floor slide up to show the rooms. **Needs the real floor plan from KNS**; until then, exterior and photos only.
- **Book a viewing of this house.**

### 6. 3BHK apartments, Raghavendra Colony: `/projects/raghavendra-colony`
- **Floor explorer:** tap a floor and it slides out; pick one of the 10 flats (1,650 sft).
- **See your view:** the camera stands on that flat's balcony at its real height and looks out.
- Flat availability colours come from a simple sheet KNS updates (until then: "Status on request").

### 7. Villa community, Ganapatiguda: `/projects/ganapatiguda-villas`
- The aerial **plot picker** from v2 (91 plots as drawn, 30 × 75 ft): tap a plot, **raise a villa on it**, switch to **dusk**.
- Plot colours from KNS's availability sheet; **Ask about plot 42** on WhatsApp.
- Clearly marked: *concept layout, subject to approvals*.

### 8. The KNS office: `/#office` (the ending)
- The camera arrives at the office. **Kiran Gajbhare's welcome**: a photo or a 20-second video (needs recording).
- **Pick a visit:** tap a day (next 7 days) and a time (morning, afternoon, evening) → **Confirm on WhatsApp**.
- **Directions**, call, office hours, and trust facts: RERA numbers, approvals, material brands, real Google reviews (only real ones).

### Everywhere
- **Share** on every section, project, plot and design.
- **Language:** English, తెలుగు, हिंदी (KNS checks the translations).
- **Sound:** gentle ambience, off by default.
- **Automatic quality** for cheap phones, and a plain-page fallback.

---

## 4. How it is built

- Next.js static export + react-three-fiber **(exists)**. One page with deep links (`#build`, `#office`) plus real pages under `/projects/*` for Google and sharing.
- The entry film is a hand-built sequence (SVG line drawing, then 3D), not a video file, so it stays light.
- **Realism ceiling, honestly:** code-drawn buildings will never look like photographs. The biggest jump is **KNS's architect exporting their real 3D models** (SketchUp or Revit → glTF). I can load them straight into the world, which turns the models into *their* actual buildings.

---

## 5. What KNS must provide (nothing is invented)

| Needed | Unlocks |
|---|---|
| List of **completed projects**: name, area, year, 3–6 photos each | Projects map, trust |
| **Floor plans** of the duplex and the apartments | Lift-the-roof, flat picker |
| **Availability sheet** (plots, flats) | Coloured plots and flats |
| **TS-RERA numbers**, approvals | Legal requirement before advertising |
| **Photo or short video** of Kiran Gajbhare, office photos | The ending |
| Office hours, Google Maps pin, brands used | Visit booking, trust |
| Architect's **3D files** (if any) | Real buildings in 3D |
| Real customer reviews (with permission) | Social proof |
| Telugu/Hindi translation check | Language switch |

---

## 6. Order of work

**Phase 1, buildable now (no new content needed):** entry film, welcome signposts, Play tour, Design your home + price tag + Watch it build + share, finishes studio, sun path, villa plot picker, projects map with the four known projects, office visit picker, deep links. *About 2 to 3 working sessions.*

**Phase 2, after KNS sends content:** real photos everywhere, lift the roof, flat and plot availability, Kiran's video, reviews, languages, architect models.

**Phase 3:** analytics (privacy-friendly) and a test with real buyers, then fixes.

---

## 7. Proving it works (research)

- **Who:** 5 people who looked for a plot or a house in Hyderabad in the last year, on their own phones.
- **Tasks:** (1) "Find out what your house would cost." (2) "Show a relative the house you designed." (3) "Book a visit."
- **Success, set before testing:** 4 of 5 get a price in under 2 minutes; 4 of 5 send a WhatsApp unaided; the world runs smoothly on 4 of 5 phones.
- **After launch:** weekly count of "Seen on the KNS website" WhatsApp messages, split by section.
