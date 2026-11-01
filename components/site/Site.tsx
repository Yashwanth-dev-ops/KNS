'use client';
import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '../bits/SplitText';
import AccordionGallery from '../bits/AccordionGallery';
import TiltedCard from '../bits/TiltedCard';
import Stepper, { Step } from '../bits/Stepper';
import { Intro } from './Intro';
import { Smooth } from './Smooth';
import BuildStory from './BuildStory';
import { BottomBar } from './BottomBar';
import { company, projects, wa } from '../../lib/content';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Real photos of a finished KNS G+1 (supplied by KNS). shortcut: 573 px copies, swap in full-size files when KNS sends them.
const HOME = [
  { image: 'photos/real/front-elevation.jpg', label: 'Front elevation', alt: 'Finished KNS G+1 house with wood-grain cladding, a glass balcony and laser-cut jaali screens' },
  { image: 'photos/real/entrance-porch.jpg', label: 'Entrance porch', alt: 'Porch with marble-look wall tiles, gold inlay lines, a dark wood main door and black granite steps' },
  { image: 'photos/real/living-false-ceiling.jpg', label: 'Living room', alt: 'Living room with a layered false ceiling, warm cove lights and a marble-look floor' },
  { image: 'photos/real/modular-kitchen.jpg', label: 'Kitchen', alt: 'Modular kitchen with a black granite platform and black and white marble-look tiles' },
  { image: 'photos/real/side-passage-jaali.jpg', label: 'Jaali detail', alt: 'Round black laser-cut jaali artwork on a white passage wall' },
];
const PACKAGES = [
  { name: 'Standard residential', lo: 1600, hi: 1800 },
  { name: 'Premium residential', lo: 1900, hi: 2200, featured: true },
  { name: 'Commercial', lo: 2200, hi: 2500 },
];
const INCLUDED: [string, string][] = [
  ['Civil', 'Excavation, footings, RCC foundation, columns, beams, slabs, red brick masonry, plastering'],
  ['Materials', 'Premium cement, TMT steel, river or robo sand, red bricks, aggregate'],
  ['Flooring', 'Premium vitrified tiles, granite staircase, anti-skid balcony tiles'],
  ['Doors and windows', 'Teak-finish main door, UPVC or aluminium windows, flush bedroom doors'],
  ['Electrical', 'Concealed copper wiring, modular switches, DB and MCBs'],
  ['Plumbing', 'CPVC and PVC piping, premium bathroom fittings, overhead and underground tanks'],
  ['Painting', 'Putty finish, premium emulsion inside, weatherproof paint outside'],
  ['Kitchen and baths', 'Granite platform, steel sink, dado and designer wall tiles, sanitary ware, CP fittings'],
];
const PROJECT_IMG: Record<string, string> = {
  'kondapur-duplex': 'photos/real/living-false-ceiling.jpg',
  'raghavendra-colony-apartments': 'photos/flyer-modern-house.jpg',
  'ganapatiguda-villas': 'brand/villa-layout.jpg',
  'open-plots': 'photos/flyer-villa-dusk.jpg',
};
const JAALI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='none' stroke='%23c9a043' stroke-width='1'%3E%3Ccircle cx='40' cy='40' r='18'/%3E%3Cpath d='M40 22c6 8 6 28 0 36M40 22c-6 8-6 28 0 36M22 40c8-6 28-6 36 0M22 40c8 6 28 6 36 0'/%3E%3Ccircle cx='0' cy='0' r='12'/%3E%3Ccircle cx='80' cy='0' r='12'/%3E%3Ccircle cx='0' cy='80' r='12'/%3E%3Ccircle cx='80' cy='80' r='12'/%3E%3C/g%3E%3C/svg%3E\")";
// Phones swipe sideways through a row; from sm up it is a grid again.
const ROW = 'flex snap-x snap-mandatory gap-4 overflow-x-auto -mx-4 px-4 pb-3 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500';
const CELL = 'w-[80%] shrink-0 snap-center sm:w-auto';
const lakh = (r: number) => (r / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 1 });
const btn = 'inline-flex min-h-12 items-center justify-center rounded-md px-6 font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
const longDate = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Site() {
  const [ready, setReady] = useState(false);
  return (
    <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <Smooth paused={!ready} />
      <Intro onDone={() => setReady(true)} />
      <Header />
      <main id="main">
        <Hero ready={ready} />
        <BuildStory />
        <Designs />
        <InsideHome />
        <Packages />
        <Projects />
        <Visit />
      </main>
      <Footer />
      <BottomBar />
    </div>
  );
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  // Out of the way while reading down, back as soon as the visitor scrolls up.
  useMotionValueEvent(scrollY, 'change', (y) => setHidden(y > 200 && y > (scrollY.getPrevious() ?? 0)));
  return (
    <motion.header animate={{ y: hidden ? '-100%' : '0%' }} transition={{ duration: 0.3 }} className="fixed inset-x-0 top-0 z-50 border-b border-charcoal/10 bg-lime/90 text-charcoal backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded focus:bg-brick focus:px-3 focus:py-2 focus:text-lime">Skip to content</a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <a href="#main" aria-label={`${company.name}, home`} className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-brick"><img data-header-logo src="brand/kns-logo-dark.png" alt="" width={530} height={360} className="h-14 w-auto sm:h-16" /></a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-6 text-sm text-charcoal/80">
            {[['#process', 'How we build'], ['#designs', '3D designs'], ['#home', 'Our work'], ['#packages', 'Prices'], ['#projects', 'Projects'], ['#visit', 'Visit']].map(([h, t]) => (
              <li key={h}><a href={h} className="rounded py-2 transition-colors duration-150 hover:text-brick focus-visible:outline focus-visible:outline-2 focus-visible:outline-brick">{t}</a></li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${company.tel[0]}`} className={`${btn} hidden min-h-10 bg-charcoal/10 px-4 text-sm text-charcoal hover:bg-charcoal/15 focus-visible:outline-brick sm:inline-flex`}>Call</a>
          <a href={wa('Hello KNS, I saw your website')} target="_blank" rel="noreferrer" className={`${btn} hidden min-h-10 bg-brick px-4 text-sm text-lime hover:bg-terracotta active:translate-y-px focus-visible:outline-brick sm:inline-flex`}>WhatsApp</a>
        </div>
      </div>
    </motion.header>
  );
}

function Hero({ ready }: { ready: boolean }) {
  const title = 'Homes built brick by brick in Hyderabad';
  return (
    <section className="relative overflow-hidden bg-navy-900 pb-20 pt-32 text-stone-50 sm:pb-28 sm:pt-40">
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: JAALI }} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {/* The headline animates in once the intro has finished; before that it is in the page but invisible. */}
          {ready
            ? <SplitText tag="h1" text={title} splitType="words" effect="rise" trigger="load" className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl" textAlign="left" />
            : <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight opacity-0 sm:text-7xl">{title}</h1>}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-50/80">Turnkey G+1 houses from ₹1,600 a square foot, materials included. Ready homes, apartments and plots in Kondapur.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#packages" className={`${btn} bg-gold-500 text-navy-950 hover:bg-gold-400 focus-visible:outline-gold-300`}>See prices</a>
            <a href="#visit" className={`${btn} border border-white/30 hover:bg-white/10 focus-visible:outline-gold-300`}>Book a site visit</a>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6 text-sm">
            <div><dt className="text-stone-50/70">From</dt><dd className="mt-1 font-display text-2xl tabular-nums">₹1,600/sft</dd></div>
            <div><dt className="text-stone-50/70">Includes</dt><dd className="mt-1 font-display text-2xl">Materials</dd></div>
            <div><dt className="text-stone-50/70">Office</dt><dd className="mt-1 font-display text-2xl">Kondapur</dd></div>
          </dl>
        </div>
        <figure className="mx-auto w-full max-w-md">
          <TiltedCard imageSrc="photos/real/front-elevation.jpg" altText={HOME[0].alt} containerHeight="440px" containerWidth="100%" imageHeight="440px" imageWidth="100%" rotateAmplitude={8} scaleOnHover={1.03} showTooltip={false} radius={14} />
          <figcaption className="mt-3 text-sm text-stone-50/70">A finished KNS G+1 house in Hyderabad.</figcaption>
        </figure>
      </div>
    </section>
  );
}

// KNS's 3D design renders (AI-assisted, supplied by KNS). Shown as designs, never as finished work.
const DESIGNS = [
  { src: 'photos/design/exterior.jpg', t: 'Elevation', alt: 'Design render of a G+1 elevation with a slate frame, wood fins and a jaali gate' },
  { src: 'photos/design/living.jpg', t: 'Living room', alt: 'Design render of a living room with a marble TV wall and a cove-lit ceiling' },
  { src: 'photos/design/kitchen.jpg', t: 'Kitchen', alt: 'Design render of an L-shaped modular kitchen with black granite' },
  { src: 'photos/design/bedroom.jpg', t: 'Bedroom', alt: 'Design render of a bedroom with a padded headboard and wardrobe' },
];

function Designs() {
  return (
    <section id="designs" className="bg-stone-50 py-20 text-navy-900 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">See your home in 3D before we start</h2>
          <p className="mt-4 max-w-xl text-lg text-navy-900/75">Every KNS home gets 3D designs of the elevation and the rooms, so you sign off on how it looks before a brick is laid.</p>
        </Reveal>
        <ul className={`${ROW} mt-10 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4`} aria-label="3D designs, swipe for more" tabIndex={0}>
          {DESIGNS.map((d) => (
            <li key={d.src} className={CELL}>
              <img src={d.src} alt={d.alt} width={1024} height={1024} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
              <p className="mt-2 font-medium">{d.t}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href={wa('Hello KNS, I would like a 3D design for my house. (Seen on your website)')} target="_blank" rel="noreferrer" className={`${btn} bg-navy-900 text-stone-50 hover:bg-navy-800 focus-visible:outline-gold-500`}>Ask for a 3D design</a>
          <p className="text-sm text-navy-900/65">Design renders, not photos of finished homes.</p>
        </div>
      </div>
    </section>
  );
}

function InsideHome() {
  return (
    <section id="home" className="bg-stone-50 py-20 text-navy-900 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Inside a finished KNS home</h2>
          <p className="mt-4 max-w-xl text-lg text-navy-900/75">One G+1 house, from the gate to the kitchen. Swipe or tap through it.</p>
        </Reveal>
        <ul className={`${ROW} mt-10 sm:hidden`} aria-label="Photos, swipe for more" tabIndex={0}>
          {HOME.map((h) => (
            <li key={h.image} className={CELL}>
              <img src={h.image} alt={h.alt} loading="lazy" width={573} height={573} className="aspect-[4/5] w-full rounded-xl object-cover" />
              <p className="mt-2 text-sm font-medium">{h.label}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 hidden sm:block">
          <AccordionGallery items={HOME} defaultIndex={0} accentColor="#c9a043" overlayColor="#0b0e19" height={480} radius={14} trigger="click" />
        </div>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="packages" className="bg-stone-50 py-20 text-navy-900 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Priced by the square foot, materials included</h2>
          <p className="mt-4 max-w-xl text-lg text-navy-900/75">A G+1 on a 200 sq yd plot is about 2,800 to 3,200 sft. The final cost follows your design, location and specifications.</p>
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <li key={p.name} className={`flex flex-col rounded-xl border p-6 ${p.featured ? 'border-gold-500 bg-white shadow-lg shadow-navy-900/10' : 'border-navy-900/15'}`}>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-3 font-display text-4xl font-semibold tabular-nums tracking-tight">₹{p.lo.toLocaleString('en-IN')} to {p.hi.toLocaleString('en-IN')}</p>
              <p className="text-sm text-navy-900/70">a square foot</p>
              <p className="mt-5 border-t border-navy-900/10 pt-4 text-sm text-navy-900/75">3,000 sft comes to about <strong className="tabular-nums text-navy-900">₹{lakh(p.lo * 3000)} to {lakh(p.hi * 3000)} lakh</strong>.</p>
              <a href={wa(`Hello KNS, I want a quote for the ${p.name} package. (Seen on your website)`)} target="_blank" rel="noreferrer" className={`${btn} mt-auto ${p.featured ? 'bg-gold-500 text-navy-950 hover:bg-gold-400' : 'bg-navy-900 text-stone-50 hover:bg-navy-800'} focus-visible:outline-gold-500`}>Get a quote</a>
            </li>
          ))}
        </ul>
        <Reveal className="mt-16">
          <h3 className="font-display text-3xl font-semibold">Included in every package</h3>
          <dl className="mt-6 grid gap-x-10 border-t border-navy-900/15 md:grid-cols-2">
            {INCLUDED.map(([k, v]) => <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 border-b border-navy-900/10 py-4"><dt className="font-semibold">{k}</dt><dd className="text-navy-900/75">{v}</dd></div>)}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="bg-stone-50 py-20 text-navy-900 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal><h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Homes and plots from KNS</h2></Reveal>
        <ul className={`${ROW} mt-12 sm:grid sm:gap-10 sm:grid-cols-2`} aria-label="Projects, swipe for more" tabIndex={0}>
          {projects.map((p) => (
            <li key={p.slug} className={CELL}>
              <TiltedCard imageSrc={PROJECT_IMG[p.slug]} altText={p.name} containerHeight="300px" containerWidth="100%" imageHeight="300px" imageWidth="100%" rotateAmplitude={6} scaleOnHover={1.02} showTooltip={false} radius={14} />
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold leading-tight">{p.name}</h3>
                <span className="shrink-0 rounded-full bg-gold-500/20 px-2.5 py-1 text-xs font-semibold">{p.status}</span>
              </div>
              <p className="mt-2 text-navy-900/75">{p.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`projects/${p.slug}/`} className={`${btn} min-h-11 bg-navy-900 px-5 text-sm text-stone-50 hover:bg-navy-800 focus-visible:outline-gold-500`}>Details</a>
                <a href={wa(`Hello KNS, I want to know about ${p.name}. (Seen on your website)`)} target="_blank" rel="noreferrer" className={`${btn} min-h-11 border border-navy-900/20 px-5 text-sm hover:bg-navy-900/5 focus-visible:outline-gold-500`}>Ask on WhatsApp</a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-navy-900/70">The apartment and plot images are artist&apos;s impressions and a concept layout. TS-RERA registration numbers will be shown here.</p>
      </div>
    </section>
  );
}

function Visit() {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
  const [what, setWhat] = useState('');
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const chip = (on: boolean) => `min-h-11 rounded-md border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 ${on ? 'border-navy-900 bg-navy-900 text-stone-50' : 'border-navy-900/20 hover:border-navy-900/50'}`;
  const canNext = step === 1 ? !!what : step === 2 ? day != null && !!time : true;
  const send = () => {
    const when = day != null ? longDate(days[day]) : '';
    window.open(wa(`Hello KNS${name.trim() ? `, I am ${name.trim()}` : ''}. I would like a site visit for: ${what}. Preferred: ${when}, ${time.toLowerCase()}. (Booked on your website)`), '_blank', 'noopener');
  };
  return (
    <section id="visit" className="bg-stone-50 pb-24 text-navy-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Book a site visit</h2>
          <p className="mt-4 text-lg text-navy-900/75">Three quick choices. Your request opens in WhatsApp, ready to send.</p>
        </Reveal>
        <div className="mt-8">
          <Stepper step={step} onStepChange={setStep} onFinalStepCompleted={send} theme="light" accentColor="#a58747" linear
            nextButtonProps={{ disabled: !canNext }} completeButtonText="Send on WhatsApp"
            completedContent={<p className="py-6 text-center">WhatsApp opened with your request. Press send there to reach KNS.</p>}>
            <Step>
              <p className="font-semibold">What would you like to see?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Turnkey construction', 'Kondapur duplex', 'Apartments', 'Villa plots', 'Open plots'].map((w) => <button key={w} type="button" aria-pressed={what === w} onClick={() => setWhat(w)} className={chip(what === w)}>{w}</button>)}
              </div>
            </Step>
            <Step>
              <p className="font-semibold">Pick a day and a time</p>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {days.map((d, i) => <button key={i} type="button" aria-pressed={day === i} onClick={() => setDay(i)} className={`${chip(day === i)} px-1 text-xs leading-tight`}>{d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</button>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Morning, 10 am to 1 pm', 'Afternoon, 2 to 5 pm', 'Evening, 5 to 7 pm'].map((t) => <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={chip(time === t)}>{t}</button>)}
              </div>
            </Step>
            <Step>
              <label htmlFor="visit-name" className="font-semibold">Your name <span className="font-normal text-navy-900/70">(optional)</span></label>
              <input id="visit-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-3 block min-h-12 w-full rounded-md border border-navy-900/25 bg-white px-3 text-base outline-none focus-visible:border-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500" />
              <p className="mt-3 text-sm text-navy-900/70">{what}, {day != null ? longDate(days[day]) : ''}, {time.toLowerCase()}.</p>
            </Step>
          </Stepper>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-950 px-4 py-14 text-stone-50/80 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <img src="brand/kns-logo.png" alt={company.name} width={530} height={360} className="w-48" loading="lazy" />
          <p className="mt-4 font-display text-xl text-stone-50">{company.proprietor}, Proprietor</p>
        </div>
        <address className="not-italic leading-relaxed">
          {company.address.map((l) => <span key={l} className="block">{l}</span>)}
          <a className="mt-3 inline-block text-gold-300 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400" href="https://www.google.com/maps/search/?api=1&query=Raghavendra%20Colony%2C%20Kondapur%2C%20Hyderabad%20500084" target="_blank" rel="noreferrer">Directions</a>
        </address>
        <div className="leading-relaxed">
          {company.phones.map((p, i) => <a key={p} className="block hover:text-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400" href={`tel:${company.tel[i]}`}>{p}</a>)}
          <a className="block hover:text-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400" href={`mailto:${company.email}`}>{company.email}</a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-sm text-stone-50/70">Prices are estimates and vary with design, location and specifications.</p>
    </footer>
  );
}
