# KNS 3D world: journey, research, QA and handoff

Status: working build, not yet tested with real buyers. Everything marked **assumption** below is a guess until the research in § 2 is done.

## 1. Proto journey map (assumption-based, one persona)

Persona (assumption): a Hyderabad family or IT professional looking for a plot or a G+1 house, on a mid-range Android phone, arriving from a Google Business post or a WhatsApp forward.

| Phase | Action | Thinking | Feeling | Touchpoint | Opportunity (built) |
|---|---|---|---|---|---|
| Discover | Taps a Google post or a WhatsApp link | Is this a real builder? | Curious, wary | Google post, WhatsApp | Page title and description name the real offer and price |
| Arrive | Waits for the world to load | Is it broken? | Impatient | Intro screen | Logo at once, % progress, Call and WhatsApp on the intro, "Read as a page" |
| Enter | Opens the gate | Oh, this is different | Impressed (**moment of truth 1**) | Gate with the KNS sign | Gate opens, camera glides through |
| Explore | Visits plots, construction, homes | What does it cost? Can I trust them? | Interested | Zone panels | Real prices, specs and listings in every panel |
| Decide | Asks a question | Who do I talk to? | Ready (**moment of truth 2**) | WhatsApp button | Every panel pre-fills a WhatsApp message naming the zone |
| End | Reaches the office | Where are they? | Reassured (peak-end) | Office zone | Tour ends at the office: address, phones, WhatsApp |

## 2. Research plan (guerrilla, one week, about ₹0)

- **Who:** 5 people who bought or are actively looking for a plot or a house in Hyderabad in the last 12 months. Recruit from KNS's own past enquiries and WhatsApp contacts.
- **How:** 20 minutes each, on their own phone, in person or on a video call. Send the link, watch, don't help.
- **Tasks:** 1) "Find out what it would cost to build a G+1 house." 2) "Ask KNS about the Kondapur duplex." 3) "Find the office address."
- **Measure:** time to first WhatsApp tap; whether the 3D loads and runs smoothly on their phone (note the model); where they hesitate; whether they choose "Read as a page".
- **Decide after:** if 2 of 5 phones stutter, make the faster mode the phone default and cut effects; if people skip the 3D, lead with the page and keep the world as a feature.
- **Track after launch:** WhatsApp messages that say "Seen on the KNS 3D website" (the pre-filled text makes this countable).

## 3. QA checklist before launch

- [ ] Content: every price, size, phone and address in `lib/content.ts` confirmed by Kiran Gajbhare
- [ ] RERA: TS-RERA numbers added for the apartments and the villa layout, or those listings removed
- [ ] Villa layout PDF corrected (its area table adds up to 114% and 9.40 acres)
- [ ] Real phones: one cheap Android, one mid-range Android, one iPhone; load time on 4G under 10 s
- [ ] Every zone button flies to its zone; every WhatsApp button opens with the right message
- [ ] Dusk, Walk, Faster and Read as a page all work; Esc closes a panel
- [ ] Accessibility: axe has 0 violations (last run: 0); keyboard Tab order stays inside the visible view
- [ ] Reduced motion: no camera glides, crane still
- [ ] Page view works with 3D off (no WebGL), and Google can read it (view source shows the text)

## 4. Handoff

- **Content owner:** KNS (Kiran Gajbhare). All text, prices and listings live in one file: `lib/content.ts`. Change it, rebuild, redeploy.
- **3D:** `components/scene/*` (models), `components/World.tsx` (lighting, camera, walking), `components/Experience.tsx` (interface). Colours: navy `#14192b`, gold `#a58747` (sampled from the business card).
- **Logo:** `public/brand/kns-logo.png`, cut from the business card image. Replace with the original vector logo when KNS has it.
- **Build:** `npm install`, then `npm run build`. Output is static files in `out/`, with relative paths, so any folder or host works.
- **Deploy:** upload `out/` to Netlify, Vercel or GitHub Pages, and point the domain at it. No server needed.
