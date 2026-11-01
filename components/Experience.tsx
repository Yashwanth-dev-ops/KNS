'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useWorld, quote, lakh, PACKAGES, FINISHES, encodeDesign, decodeDesign, type Design } from '../lib/store';
import { zones, projects, company, wa, type Photo } from '../lib/content';
import { villaPlots } from './scene/Villas';
import { EntryFilm } from './EntryFilm';
import { detectQuality, type Quality } from '../lib/gpu';

const World = dynamic(() => import('./World'), { ssr: false });
const LOGO = '../brand/kns-logo.png';
const ease = [0.16, 1, 0.3, 1] as const;
const TOUR = ['projects', 'build', 'finish', 'duplex', 'apartments', 'plots', 'office'];
const CAPTIONS: Record<string, string> = {
  projects: 'Every KNS project on one map.',
  build: 'Your house, priced as you design it.',
  finish: 'Pick the floors, granite, walls and door.',
  duplex: 'Ready to move in Kondapur, east facing.',
  apartments: 'Ten 3BHK flats in Raghavendra Colony.',
  plots: 'A planned villa community at Ganapatiguda.',
  office: 'Come and see a site with KNS.',
};

function canRun3D() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
const pageUrl = () => location.href.split('#')[0];
function share(text: string, hash: string) {
  const url = `${pageUrl()}#${hash}`;
  const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
  if (nav.share) { nav.share({ title: company.name, text, url }).catch(() => {}); return; }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
}
const btn = 'inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500';
const gold = `${btn} bg-gold-500 text-navy-950 hover:bg-gold-400`;
const dark = `${btn} bg-navy-900 text-stone-50 hover:bg-navy-800`;
const ghost = `${btn} border border-navy-900/20 text-navy-900 hover:bg-navy-900/5`;

export default function Experience() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { (window as unknown as { __kns: typeof useWorld }).__kns = useWorld; }, []);
  const pageView = useWorld((s) => s.pageView), setPageView = useWorld((s) => s.setPageView), setQuality = useWorld((s) => s.setQuality);
  useEffect(() => {
    const has = canRun3D(); setOk(has);
    if (!has) { useWorld.getState().setNotice('This device cannot show 3D, so here is the page version.'); setPageView(true); }
    setQuality(detectQuality());
  }, [setPageView, setQuality]);
  useEffect(() => {
    const on = !!ok && !pageView;
    document.documentElement.classList.toggle('world-on', on);
    document.querySelector('main.page')?.toggleAttribute('inert', on);
  }, [ok, pageView]);
  if (!ok || pageView) return ok ? <BackTo3D /> : null;
  return (
    <section aria-label="The KNS world in 3D" className="fixed inset-0 z-10 bg-navy-950">
      <World />
      <p className="sr-only">A 3D model of KNS Construction and Real Estate: the entry gate with the KNS sign, a projects map, a house you can design, a finishes studio, a ready-to-move duplex, an apartment block, the villa community and the KNS office.</p>
      <EntryFilm />
      <DeepLinks />
      <Hud />
    </section>
  );
}

function BackTo3D() {
  const setPageView = useWorld((s) => s.setPageView);
  return <button type="button" onClick={() => setPageView(false)} className={`${dark} fixed bottom-4 right-4 z-20 shadow-lg`}>Back to the 3D world</button>;
}

/* ---------- links that open a section, a design, a project or a plot ---------- */
function DeepLinks() {
  const phase = useWorld((s) => s.phase);
  const zone = useWorld((s) => s.zone), project = useWorld((s) => s.project), plot = useWorld((s) => s.plot);
  const villas = useWorld((s) => s.villas), design = useWorld((s) => s.design);
  const applied = useRef(false);
  useEffect(() => {
    if (phase !== 'explore' || applied.current) return;
    applied.current = true;
    const st = useWorld.getState();
    const h = decodeURIComponent(location.hash.slice(1));
    const d = decodeDesign(h);
    if (d) { st.setDesign(d); st.setZone('build'); return; }
    const pm = h.match(/^plot-(\d+)$/);
    if (pm && villaPlots.some((p) => p.n === Number(pm[1]))) { st.setZone('plots'); st.setVillas(true); setTimeout(() => useWorld.getState().setPlot(Number(pm[1])), 50); return; }
    const pr = projects.find((p) => p.slug === h);
    if (pr) { st.setZone('projects'); setTimeout(() => useWorld.getState().setProject(pr.slug), 50); return; }
    if (zones.some((z) => z.id === h)) st.setZone(h);
  }, [phase]);
  // keep the address bar in step, so any view can be shared
  useEffect(() => {
    if (phase !== 'explore' || !applied.current) return;
    const h = villas && plot ? `plot-${plot}` : project ? project : zone === 'build' ? encodeDesign(design) : zone ?? '';
    try { history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search); } catch { /* some viewers block history */ }
  }, [phase, zone, project, plot, villas, design]);
  return null;
}

/* ---------- the heads-up display ---------- */
function Hud() {
  const phase = useWorld((s) => s.phase);
  const zone = useWorld((s) => s.zone), setZone = useWorld((s) => s.setZone);
  const villas = useWorld((s) => s.villas);
  const touring = useWorld((s) => s.touring), setTouring = useWorld((s) => s.setTouring);
  const reduce = useReducedMotion();
  useTour();
  if (phase !== 'explore') return null;
  const i = zones.findIndex((z) => z.id === zone);
  const go = (d: number) => setZone(zones[(i + d + zones.length) % zones.length].id);
  const chip = 'min-h-10 shrink-0 whitespace-nowrap rounded-md px-3 text-xs sm:text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400';
  return (
    <motion.div className="pointer-events-none absolute inset-0 z-20" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-navy-950/75 to-transparent px-4 pb-10 pt-3 sm:px-6">
        <button type="button" onClick={() => { useWorld.getState().setVillas(false); setZone(null); }} className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400" aria-label="KNS, back to the whole site">
          <img src={LOGO} alt="" width={530} height={360} className="h-11 w-auto sm:h-14" />
        </button>
        <div className="flex items-center gap-2">
          <ViewMenu />
          <a href={`tel:${company.tel[0]}`} className={`${chip} hidden items-center bg-white/10 text-stone-50 hover:bg-white/20 sm:inline-flex`}>Call {company.phones[0].replace('+91 ', '')}</a>
          <a href={wa('Hello KNS, I saw your 3D website')} target="_blank" rel="noreferrer" className={`${chip} inline-flex items-center bg-gold-500 text-navy-950 hover:bg-gold-400`}>WhatsApp</a>
        </div>
      </header>

      <BuildBanner />
      <TourCaption />

      <AnimatePresence mode="wait">
        {villas ? <VillaPanel key="villas" /> : zone && <ZonePanel key={zone} id={zone} onPrev={() => go(-1)} onNext={() => go(1)} onClose={() => setZone(null)} />}
      </AnimatePresence>

      <nav aria-label="Sections" className="pointer-events-auto absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent px-3 pb-3 pt-10 sm:px-6 sm:pb-5">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button type="button" onClick={() => { useWorld.getState().setVillas(false); if (!touring) setZone(TOUR[0]); setTouring(!touring); }} aria-pressed={touring}
            className={`${chip} inline-flex items-center gap-2 bg-gold-500 font-semibold text-navy-950 hover:bg-gold-400`}>
            <span aria-hidden="true">{touring ? '❚❚' : '▶'}</span>{touring ? 'Pause tour' : 'Play tour'}
          </button>
          <ol className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
            {zones.map((z) => (
              <li key={z.id} className="shrink-0">
                <button type="button" onClick={() => { setTouring(false); useWorld.getState().setVillas(false); setZone(z.id); }} aria-current={zone === z.id ? 'true' : undefined}
                  className={`${chip} inline-flex items-center gap-2 border ${zone === z.id ? 'border-gold-400 bg-stone-50 text-navy-950' : 'border-white/15 bg-navy-900/85 text-stone-50 hover:bg-navy-800'}`}>
                  <span className={`tabular-nums ${zone === z.id ? 'text-gold-600' : 'text-gold-400'}`}>{z.n}</span>{z.short}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </motion.div>
  );
}

function ViewMenu() {
  const [open, setOpen] = useState(false);
  const dusk = useWorld((s) => s.dusk), toggleDusk = useWorld((s) => s.toggleDusk);
  const quality = useWorld((s) => s.quality), setQuality = useWorld((s) => s.setQuality);
  const levels: [Quality, string][] = [['high', 'Best'], ['lite', 'Balanced'], ['minimal', 'Fastest']];
  const setPageView = useWorld((s) => s.setPageView);
  const item = 'flex min-h-11 w-full items-center justify-between gap-4 rounded px-3 text-left text-sm text-navy-900 transition-colors duration-150 hover:bg-navy-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500';
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [open]);
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} aria-controls="view-menu" onClick={() => setOpen(!open)}
        className="min-h-10 rounded-md bg-white/10 px-3 text-xs font-medium text-stone-50 transition-colors duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400 sm:text-sm">View</button>
      {open && (
        <div id="view-menu" className="absolute right-0 top-12 w-56 rounded-lg bg-stone-50 p-1.5 shadow-2xl">
          <button type="button" role="switch" aria-checked={dusk} onClick={toggleDusk} className={item}>Dusk <span className="text-navy-900/70">{dusk ? 'On' : 'Off'}</span></button>
          <div role="radiogroup" aria-label="Picture quality" className="px-3 pb-1 pt-2">
            <p className="text-xs text-navy-900/70">Picture quality</p>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {levels.map(([q, t]) => (
                <button key={q} type="button" role="radio" aria-checked={quality === q} onClick={() => setQuality(q)}
                  className={`min-h-10 rounded text-xs font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 ${quality === q ? 'bg-navy-900 text-stone-50' : 'bg-navy-900/5 text-navy-900 hover:bg-navy-900/10'}`}>{t}</button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setPageView(true)} className={item}>Read as a page</button>
        </div>
      )}
    </div>
  );
}

/* ---------- the guided tour: one section after another, captions, hands back on touch ---------- */
function useTour() {
  const touring = useWorld((s) => s.touring), zone = useWorld((s) => s.zone);
  useEffect(() => {
    if (!touring) return;
    const i = TOUR.indexOf(zone ?? '');
    if (i === -1) { useWorld.getState().setZone(TOUR[0]); return; }
    if (i === TOUR.length - 1) { const t = setTimeout(() => useWorld.getState().setTouring(false), 7000); return () => clearTimeout(t); }
    const t = setTimeout(() => useWorld.getState().setZone(TOUR[i + 1]), 7000);
    return () => clearTimeout(t);
  }, [touring, zone]);
}
function TourCaption() {
  const touring = useWorld((s) => s.touring), zone = useWorld((s) => s.zone);
  if (!touring || !zone) return null;
  const i = TOUR.indexOf(zone);
  return (
    <div className="absolute inset-x-0 bottom-20 flex flex-col items-center gap-2 px-4 sm:bottom-24" role="status">
      <p className="rounded-full bg-navy-950/75 px-5 py-2 text-center font-display text-xl text-stone-50 backdrop-blur sm:text-2xl">{CAPTIONS[zone]}</p>
      <ol className="flex gap-1.5" aria-label={`Chapter ${i + 1} of ${TOUR.length}`}>
        {TOUR.map((t, k) => <li key={t} className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? 'w-6 bg-gold-400' : 'w-1.5 bg-white/40'}`} />)}
      </ol>
    </div>
  );
}

/* ---------- the panel for each section ---------- */
const STAGES = ['Cleared site', 'Footings and plinth', 'Columns and slabs', 'Brickwork', 'Handed over'];
const STAGE_NOTES = ['Survey, marking and excavation.', 'RCC footings in premium cement, with river or robo sand.', 'TMT steel columns, beams and slabs, floor by floor.', 'Red brick masonry, plastering, concealed copper wiring, CPVC plumbing.', 'Tiles, granite, teak-finish door, UPVC windows, emulsion and weatherproof paint.'];

function BuildBanner() {
  const build = useWorld((s) => s.build), zone = useWorld((s) => s.zone), touring = useWorld((s) => s.touring);
  if (zone !== 'build' || touring || build === 4) return null;
  return (
    <p role="status" className="absolute left-1/2 top-[4.75rem] max-w-[90vw] -translate-x-1/2 rounded-xl bg-gold-500 px-4 py-2 text-center text-navy-950 shadow-lg sm:top-20">
      <span className="block text-sm font-semibold">Stage {build + 1} of 5: {STAGES[build]}</span>
      <span className="block text-xs">{STAGE_NOTES[build]}</span>
    </p>
  );
}

function Panel({ label, children, onClose }: { label: string; children: React.ReactNode; onClose: () => void }) {
  const reduce = useReducedMotion();
  const touring = useWorld((s) => s.touring);
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (!useWorld.getState().touring) head.current?.focus({ preventScroll: true }); }, [label]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <motion.section aria-labelledby="panel-title"
      className={`pointer-events-auto absolute inset-x-3 bottom-[5.5rem] max-h-[52vh] overflow-y-auto rounded-xl bg-stone-50/95 p-5 text-navy-900 shadow-2xl shadow-navy-950/40 backdrop-blur sm:inset-x-auto sm:bottom-auto sm:left-6 sm:top-24 sm:max-h-[calc(100vh-12rem)] sm:w-[24rem] sm:p-6 ${touring ? 'max-sm:hidden' : ''}`}
      initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -10, transition: { duration: 0.2 } }} transition={{ duration: 0.45, ease }}>
      <div className="flex items-start justify-between gap-3">
        <h2 id="panel-title" ref={head} tabIndex={-1} className="font-display text-3xl font-semibold leading-tight tracking-tight outline-none">{label}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-md text-xl text-navy-900/60 transition-colors duration-150 hover:bg-navy-900/5 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">×</button>
      </div>
      {children}
    </motion.section>
  );
}

function ZonePanel({ id, onPrev, onNext, onClose }: { id: string; onPrev: () => void; onNext: () => void; onClose: () => void }) {
  const z = zones.find((q) => q.id === id)!;
  return (
    <Panel label={z.title} onClose={onClose}>
      <p className="mt-2 leading-relaxed text-navy-900/75">{z.body}</p>
      {id === 'projects' && <ProjectsBody />}
      {id === 'build' && <DesignBody />}
      {id === 'finish' && <FinishesBody />}
      {id === 'duplex' && <SunBody />}
      {id === 'apartments' && <ApartmentBody />}
      {id === 'plots' && <PlotsBody />}
      {id === 'office' && <VisitBody />}
      {!['projects', 'build', 'finish', 'office'].includes(id) && <Facts facts={z.facts} />}
      {z.photos && id !== 'projects' && <PhotoStrip photos={z.photos} />}
      {id !== 'office' && id !== 'build' && (
        <a href={wa(`${z.ask}. (Seen on the KNS website)`)} target="_blank" rel="noreferrer" className={`${dark} mt-5 w-full`}>Ask on WhatsApp</a>
      )}
      <div className="mt-3 flex justify-between text-sm">
        <button type="button" onClick={onPrev} className="rounded px-1 py-2 font-medium text-navy-900/70 transition-colors duration-150 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">Previous</button>
        <button type="button" onClick={() => share(`${z.title}, KNS Construction and Real Estate`, id)} className="rounded px-1 py-2 font-medium text-navy-900/70 transition-colors duration-150 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">Share</button>
        <button type="button" onClick={onNext} className="rounded px-1 py-2 font-medium text-navy-900/70 transition-colors duration-150 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">Next</button>
      </div>
    </Panel>
  );
}

function Facts({ facts }: { facts: [string, string][] }) {
  return (
    <dl className="mt-4 divide-y divide-navy-900/10 border-y border-navy-900/10 text-sm">
      {facts.map(([k, v]) => <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5"><dt className="text-navy-900/70">{k}</dt><dd className="font-medium tabular-nums">{v}</dd></div>)}
    </dl>
  );
}

function Seg<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; t: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-navy-900/80">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={String(o.v)} className={`inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm font-medium transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-500 ${value === o.v ? 'border-navy-900 bg-navy-900 text-stone-50' : 'border-navy-900/20 hover:border-navy-900/50'}`}>
            <input type="radio" className="sr-only" name={label} checked={value === o.v} onChange={() => onChange(o.v)} />{o.t}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function useBuildPlayer() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    const step = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 2300;
    [0, 1, 2, 3, 4].forEach((n, k) => timers.current.push(setTimeout(() => useWorld.getState().setBuild(n), k * step)));
  }, []);
}

function designText(d: Design) {
  const q = quote(d);
  return `Hello KNS, I designed my house on your website: ${d.plot} sq yd plot, ${d.floors === 2 ? 'G+1' : 'G+2'}, ${PACKAGES[d.pkg].name}, ${d.facing} facing, about ${q.sft.toLocaleString('en-IN')} sft. Estimate shown: ₹${lakh(q.lo)} to ${lakh(q.hi)} lakh. Finishes: ${FINISHES.tile[d.tile].name} floor, ${FINISHES.granite[d.granite].name} granite, ${FINISHES.paint[d.paint].name} walls, ${FINISHES.door[d.door].name} door. Please send me an exact quote.`;
}

function DesignBody() {
  const d = useWorld((s) => s.design), setDesign = useWorld((s) => s.setDesign);
  const play = useBuildPlayer();
  const q = quote(d);
  return (
    <div>
      <Seg label="Plot" value={d.plot} options={[{ v: 150, t: '150 sq yd' }, { v: 200, t: '200 sq yd' }, { v: 300, t: '300 sq yd' }]} onChange={(v) => setDesign({ plot: v })} />
      <Seg label="Floors" value={d.floors} options={[{ v: 2, t: 'G+1' }, { v: 3, t: 'G+2' }]} onChange={(v) => setDesign({ floors: v })} />
      <Seg label="Package, materials included" value={d.pkg} options={[{ v: 'standard', t: 'Standard' }, { v: 'premium', t: 'Premium' }]} onChange={(v) => setDesign({ pkg: v })} />
      <Seg label="Facing" value={d.facing} options={[{ v: 'east', t: 'East' }, { v: 'north', t: 'North' }, { v: 'west', t: 'West' }, { v: 'south', t: 'South' }]} onChange={(v) => setDesign({ facing: v })} />
      <div className="mt-5 rounded-lg bg-navy-900 p-4 text-stone-50" aria-live="polite">
        <p className="text-sm text-stone-50/75">About {q.sft.toLocaleString('en-IN')} sft at ₹{PACKAGES[d.pkg].lo.toLocaleString('en-IN')} to {PACKAGES[d.pkg].hi.toLocaleString('en-IN')} a sft</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight">₹{lakh(q.lo)} to {lakh(q.hi)} lakh</p>
      </div>
      <p className="mt-2 text-xs text-navy-900/70">On KNS&apos;s published rates. The final cost follows the design, location and specifications. Built-up area is estimated at about 1,500 sft a floor on 200 sq yd.</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={play} className={`${gold} flex-1`}>Watch it build</button>
        <button type="button" onClick={() => useWorld.getState().setBuild(4)} className={`${ghost} flex-1`}>Finished</button>
      </div>
      <a href={wa(designText(d))} target="_blank" rel="noreferrer" className={`${dark} mt-2 w-full`}>Send my design to KNS</a>
      <button type="button" onClick={() => share('Look at the house I designed with KNS Construction', encodeDesign(d))} className={`${ghost} mt-2 w-full`}>Share my design</button>
    </div>
  );
}

function Swatches<K extends 'tile' | 'granite' | 'paint' | 'door'>({ k, label }: { k: K; label: string }) {
  const v = useWorld((s) => s.design[k]), setDesign = useWorld((s) => s.setDesign);
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-navy-900/80">{label}: <span className="text-navy-900">{FINISHES[k][v].name}</span></legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {FINISHES[k].map((f, i) => (
          <label key={f.name} title={f.name} className={`grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 transition-transform duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-500 ${v === i ? 'scale-110 border-gold-500' : 'border-transparent hover:scale-105'}`}>
            <input type="radio" className="sr-only" name={k} checked={v === i} onChange={() => setDesign({ [k]: i } as Partial<Design>)} aria-label={f.name} />
            <span className="h-8 w-8 rounded-full shadow-inner ring-1 ring-navy-900/15" style={{ background: f.color }} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FinishesBody() {
  const d = useWorld((s) => s.design), setZone = useWorld((s) => s.setZone);
  return (
    <div>
      <Swatches k="tile" label="Floor tiles" />
      <Swatches k="granite" label="Kitchen granite" />
      <Swatches k="paint" label="Wall colour" />
      <Swatches k="door" label="Main door" />
      <p className="mt-4 text-sm text-navy-900/70">Your picks are saved in your house design.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => setZone('build')} className={`${gold} flex-1`}>See my house</button>
        <a href={wa(designText(d))} target="_blank" rel="noreferrer" className={`${dark} flex-1`}>Send to KNS</a>
      </div>
    </div>
  );
}

function SunBody() {
  const h = useWorld((s) => s.sunHour), setSunHour = useWorld((s) => s.setSunHour);
  const v = h ?? 8;
  const label = `${Math.floor(v) % 12 || 12}:${String(Math.round((v % 1) * 60)).padStart(2, '0')} ${v < 12 ? 'am' : 'pm'}`;
  return (
    <div className="mt-4 rounded-lg bg-navy-900 p-4 text-stone-50">
      <label htmlFor="sun" className="flex items-baseline justify-between text-sm"><span className="font-medium">Sun across the house</span><span className="font-display text-2xl tabular-nums">{label}</span></label>
      <input id="sun" type="range" min={6} max={18} step={0.25} value={v} onChange={(e) => setSunHour(Number(e.target.value))} onFocus={() => h == null && setSunHour(8)} onPointerDown={() => h == null && setSunHour(8)}
        className="mt-3 w-full accent-[#a58747]" aria-valuetext={label} />
      <p className="mt-2 text-sm text-stone-50/75">{v < 11 ? 'Morning sun falls on the east-facing front.' : v < 14 ? 'Midday: the sun is high in the south.' : 'Evening sun moves to the back of the house.'}</p>
    </div>
  );
}

function ApartmentBody() {
  const f = useWorld((s) => s.floorView), setF = useWorld((s) => s.setFloorView);
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-medium text-navy-900/80">See the view from a balcony</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-pressed={f === n} onClick={() => setF(f === n ? null : n)}
            className={`min-h-10 rounded-md border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 ${f === n ? 'border-navy-900 bg-navy-900 text-stone-50' : 'border-navy-900/20 hover:border-navy-900/50'}`}>Floor {n}</button>
        ))}
      </div>
      <p className="mt-2 text-xs text-navy-900/70">The block is drawn as stilt parking and five floors of two flats. The final plan follows KNS&apos;s drawings.</p>
    </fieldset>
  );
}

function PlotsBody() {
  const setVillas = useWorld((s) => s.setVillas);
  return <button type="button" onClick={() => setVillas(true)} className={`${gold} mt-4 w-full`}>Fly over the villa community</button>;
}

function VillaPanel() {
  const plot = useWorld((s) => s.plot), setPlot = useWorld((s) => s.setPlot);
  const raise = useWorld((s) => s.raise), setRaise = useWorld((s) => s.setRaise), setVillas = useWorld((s) => s.setVillas);
  const p = villaPlots.find((v) => v.n === plot);
  const label = p ? `Plot ${String(p.n).padStart(2, '0')}` : 'Ganapatiguda villa community';
  return (
    <Panel label={label} onClose={() => (p ? setPlot(null) : setVillas(false))}>
      {p ? (
        <>
          <Facts facts={[['Size', '250 sq yd, 30 ft by 75 ft'], ['Where', p.z < 495 ? 'Upper portion, 6.25 acres' : 'Lower portion, 2.00 acres'], ['Status', 'On request']]} />
          <a href={wa(`Hello KNS, I am interested in plot ${p.n} at the Ganapatiguda villa community. (Seen on the KNS website)`)} target="_blank" rel="noreferrer" className={`${dark} mt-4 w-full`}>Ask about plot {p.n}</a>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => share(`Plot ${p.n} at the KNS villa community, Ganapatiguda`, `plot-${p.n}`)} className={`${ghost} flex-1`}>Share</button>
            <button type="button" onClick={() => setPlot(null)} className={`${ghost} flex-1`}>All plots</button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 leading-relaxed text-navy-900/75">100 villas of 250 sq yd on 8.25 acres at Pocharam, Patancheru. Tap any plot to see it.</p>
          <button type="button" aria-pressed={raise} onClick={() => setRaise(!raise)} className={`${gold} mt-4 w-full`}>{raise ? 'Show the open plots' : 'Raise the villas'}</button>
          <p className="mt-3 text-xs text-navy-900/70">Drawn from the concept layout: the 91 plots it shows, numbered as drawn, at the stated plot and road sizes. Villas are massing only. The final layout and count follow survey and approvals.</p>
        </>
      )}
      <button type="button" onClick={() => setVillas(false)} className="mt-3 w-full rounded py-2 text-sm font-medium text-navy-900/70 transition-colors duration-150 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">Back to the KNS world</button>
    </Panel>
  );
}

function ProjectsBody() {
  const project = useWorld((s) => s.project), setProject = useWorld((s) => s.setProject), setZone = useWorld((s) => s.setZone);
  const p = projects.find((x) => x.slug === project);
  if (!p) return (
    <ul className="mt-4 grid gap-2">
      {projects.map((x) => (
        <li key={x.slug}>
          <button type="button" onClick={() => setProject(x.slug)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-navy-900/15 px-3 py-2 text-left transition-colors duration-150 hover:border-navy-900/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">
            <span><span className="block font-medium">{x.name}</span><span className="block text-xs text-navy-900/70">{x.place}</span></span>
            <span className="shrink-0 rounded-full bg-navy-900/5 px-2 py-0.5 text-xs font-medium">{x.status}</span>
          </button>
        </li>
      ))}
      <li className="pt-2 text-xs text-navy-900/70">Completed KNS projects and their photos will be added here.</li>
    </ul>
  );
  return (
    <div className="mt-4">
      <button type="button" onClick={() => setProject(null)} className="text-sm font-medium text-navy-900/70 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">All projects</button>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">{p.name}</h3>
      <p className="mt-1 inline-block rounded-full bg-gold-500/20 px-2.5 py-0.5 text-xs font-semibold text-navy-900">{p.status}</p>
      <p className="mt-3 leading-relaxed text-navy-900/75">{p.summary}</p>
      {p.photos.length > 0 && <PhotoStrip photos={p.photos} />}
      <Facts facts={p.facts} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setZone(p.zone)} className={gold}>See it in 3D</button>
        <a href={p.maps} target="_blank" rel="noreferrer" className={ghost}>Directions</a>
        <a href={wa(`Hello KNS, I want to know about ${p.name}. (Seen on the KNS website)`)} target="_blank" rel="noreferrer" className={dark}>Ask about it</a>
        <button type="button" onClick={() => share(`${p.name} by KNS Construction`, p.slug)} className={ghost}>Share</button>
      </div>
    </div>
  );
}

function VisitBody() {
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const times = ['Morning, 10 am to 1 pm', 'Afternoon, 2 to 5 pm', 'Evening, 5 to 7 pm'];
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const ready = day != null && slot != null;
  const msg = ready ? `Hello KNS, I would like to visit a site on ${days[day!].toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}, ${slot!.toLowerCase()}. (Booked on the KNS website)` : '';
  return (
    <div>
      <p className="mt-3 text-sm font-medium text-navy-900/80">Kiran Gajbhare, Proprietor</p>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-navy-900/80">Pick a day</legend>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {days.map((d, i) => (
            <button key={i} type="button" aria-pressed={day === i} onClick={() => setDay(i)}
              className={`min-h-12 rounded-md border px-1 text-xs font-medium leading-tight transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 ${day === i ? 'border-navy-900 bg-navy-900 text-stone-50' : 'border-navy-900/20 hover:border-navy-900/50'}`}>{fmt(d)}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-navy-900/80">Pick a time</legend>
        <div className="mt-1.5 grid gap-1.5">
          {times.map((t) => (
            <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)}
              className={`min-h-10 rounded-md border px-3 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 ${slot === t ? 'border-navy-900 bg-navy-900 text-stone-50' : 'border-navy-900/20 hover:border-navy-900/50'}`}>{t}</button>
          ))}
        </div>
      </fieldset>
      {ready
        ? <a href={wa(msg)} target="_blank" rel="noreferrer" className={`${gold} mt-4 w-full`}>Confirm on WhatsApp</a>
        : <p className="mt-4 rounded-md bg-navy-900/5 px-3 py-3 text-center text-sm text-navy-900/70" role="status">Pick a day and a time to confirm.</p>}
      <Facts facts={[['Office', 'Raghavendra Colony, Bajaj Showroom Line, Kondapur, Hyderabad 500084'], ['Phone', '91004 25645, 92465 63397'], ['Email', 'knsconstructions@gmail.com']]} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href="https://www.google.com/maps/search/?api=1&query=Raghavendra%20Colony%2C%20Kondapur%2C%20Hyderabad%20500084" target="_blank" rel="noreferrer" className={ghost}>Directions</a>
        <a href={`tel:${company.tel[0]}`} className={ghost}>Call</a>
      </div>
      <p className="mt-3 text-xs text-navy-900/70">TS-RERA registration numbers will be shown here.</p>
    </div>
  );
}

function PhotoStrip({ photos }: { photos: Photo[] }) {
  return (
    <ul tabIndex={photos.length > 1 ? 0 : undefined} aria-label={photos.length > 1 ? 'Photos, scroll sideways' : undefined} className="-mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">
      {photos.map((p) => (
        <li key={p.src} className={`shrink-0 snap-start ${photos.length > 1 ? 'w-[85%]' : 'w-full'}`}>
          <figure>
            <img src={`../${p.src}`} alt={p.alt} width={p.w} height={p.h} loading="lazy" className="aspect-[16/10] w-full rounded-lg object-cover shadow-sm" />
            <figcaption className="mt-1.5 text-xs leading-snug text-navy-900/70">{p.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
