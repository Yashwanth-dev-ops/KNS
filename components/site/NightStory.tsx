'use client';
// The top of the home page: a G+1 drawn in cream line, stage by stage, under a night sky whose haze changes
// with each stage; at handover the sky goes black and the windows light up. Scroll position drives everything.
// No JS: the drawing is complete and the text is a normal list. Reduced motion: stages switch without blending.
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { company, wa } from '../../lib/content';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Per stage: sky top, sky bottom, haze, haze x %, haze y %. Values from spec Revision 3.
const SKY: [string, string, string, number, number][] = [
  ['#0b0e1c', '#141a30', '#2a3a7a', 18, 85],
  ['#0c0f15', '#161b24', '#2f3d4d', 26, 24],
  ['#100d0e', '#1c1413', '#5a2a1c', 52, 8],
  ['#110f0b', '#1f1910', '#6a4a1c', 84, 78],
  ['#020306', '#06080d', '#120f14', 70, 95],
];
const STAGES = [
  { n: 'KNS Construction, Hyderabad', t: 'Homes built brick by brick.', d: 'Turnkey G+1 houses from ₹1,600 a sq ft, materials included. Scroll and watch one go up.' },
  { n: 'Stage 2 of 5, structure', t: 'Then the frame: steel and concrete.', d: 'Footings, an RCC plinth, TMT columns and slabs, floor by floor.' },
  { n: 'Stage 3 of 5, walls', t: 'Walls, brick by brick.', d: 'Red brick masonry, plaster, concealed wiring and plumbing.' },
  { n: 'Stage 4 of 5, finishing', t: 'Plastered, painted, finished.', d: 'Elevation, tiles, granite, doors and paint, in the materials you chose.' },
  { n: 'Stage 5 of 5, handover', t: 'And then, it is home.', d: 'One contract from the plan to the keys. Tell us about your plot.' },
];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(',')})`;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const glowBtn = 'inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-b from-glow to-[var(--c-glow-deep)] px-7 font-semibold text-night shadow-[0_8px_30px_var(--c-glow-shadow)] transition-transform duration-100 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream';
const lineBtn = 'inline-flex min-h-12 items-center justify-center rounded-full border border-cream/40 px-7 font-semibold text-cream transition-colors duration-150 hover:bg-cream/10 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream';

export default function NightStory() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const el = root.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const groups = [1, 2, 3, 4, 5].map((i) => gsap.utils.toArray<SVGElement>(`.s${i}`, el));
    const frame = (p: number) => { // p runs 0..4 through the five stages
      const i = Math.min(3, Math.floor(p)), t = reduce ? Math.round(p - i) : p - i, a = SKY[i], b = SKY[i + 1];
      el.style.setProperty('--top', mix(a[0], b[0], t));
      el.style.setProperty('--bot', mix(a[1], b[1], t));
      el.style.setProperty('--haze', mix(a[2], b[2], t));
      el.style.setProperty('--hx', `${a[3] + (b[3] - a[3]) * t}%`);
      el.style.setProperty('--hy', `${a[4] + (b[4] - a[4]) * t}%`);
      el.style.setProperty('--glow', String(clamp((p - 3.4) / 0.6)));
      groups.forEach((g, k) => { const o = clamp(k - p); g.forEach((e) => e.style.setProperty('--o', String(reduce ? Math.ceil(o) : o))); });
    };
    frame(0);
    ScrollTrigger.create({ trigger: el.querySelector('.stages'), start: 'top top', end: 'bottom bottom', onUpdate: (s) => frame(s.progress * 4) });
  }, { scope: root });

  const G = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <section id="process" ref={root} aria-label="How KNS builds a home" className="relative bg-night text-cream"
      style={{ ['--top' as string]: SKY[0][0], ['--bot' as string]: SKY[0][1], ['--haze' as string]: SKY[0][2], ['--hx' as string]: '18%', ['--hy' as string]: '85%', ['--glow' as string]: 0 }}>
      {/* The sky and the drawing stay on screen while the five stages scroll past. */}
      <div aria-hidden="true" className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh] overflow-hidden">
        <div className="absolute inset-0 [background:radial-gradient(circle_at_var(--hx)_var(--hy),var(--haze)_0,color-mix(in_srgb,var(--haze)_35%,transparent)_18%,transparent_48%),linear-gradient(180deg,var(--top),var(--bot))]" />
        <div className="night-stars absolute inset-0 opacity-[var(--glow)]" />
        <div className="absolute bottom-[8%] right-[14%] h-[30vh] w-[46vw] opacity-[var(--glow)] [background:radial-gradient(ellipse_at_center,var(--c-spill),transparent_65%)]" />
        <div className="grain absolute inset-0" />
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-12">
          <div />
          <div className="hidden place-items-center lg:grid">
            <svg viewBox="0 0 600 520" className="night-drawing w-full max-w-[620px] overflow-visible">
              <g className="glow-windows">
                <rect x="316" y="361" width="68" height="58" /><rect x="361" y="231" width="38" height="58" />
                <rect x="176" y="351" width="73" height="103" /><rect x="133" y="223" width="186" height="60" />
              </g>
              <g {...G} strokeWidth="1" opacity="0.5">
                {[100, 200, 300, 400, 500].map((x) => <path key={x} pathLength={1} className="s1" d={`M${x} 90 V505`} />)}
                {[180, 330, 470].map((y) => <path key={y} pathLength={1} className="s1" d={`M40 ${y} H560`} />)}
              </g>
              <g {...G} strokeWidth="1.6">
                <path pathLength={1} className="s1" d="M30 470 H570" />
                <path pathLength={1} className="s1" d="M140 500 V510 M460 500 V510 M140 505 H460" />
                <path pathLength={1} className="s2" d="M128 470 V500 H172 V470 M278 470 V500 H322 V470 M428 470 V500 H472 V470" />
                <path pathLength={1} className="s2" d="M136 470 V455 H464 V470" />
                <path pathLength={1} className="s3" strokeWidth="2.4" d="M150 455 V180 M300 455 V200 M450 455 V200" />
                <path pathLength={1} className="s3" strokeWidth="2.4" d="M140 330 H460 M140 200 H460 M150 180 H250" />
                <path pathLength={1} className="s4" d="M140 455 V200 M460 455 V200 M250 200 V120 H150 V180" />
                <path pathLength={1} className="s4" d="M140 195 H460 V182 H250 M140 195 V182 H150" />
                <path pathLength={1} className="s4" d="M315 360 H385 V420 H315 Z M350 360 V420 M175 350 H250 V455 M360 230 H400 V290 H360 Z" />
                <path pathLength={1} className="s5" strokeWidth="3" d="M120 212 H332 V318 H120 Z M132 222 H320 V308" />
                <path pathLength={1} className="s5" d="M140 285 H320 M140 296 H320" />
                {[404, 414, 424, 434, 444].map((x) => <path key={x} pathLength={1} className="s5" d={`M${x} 200 V455`} />)}
                <path pathLength={1} className="s5" d="M200 155 V140 M200 140 q-14 -6 -10 -18 q10 2 10 18 q2 -16 12 -18 q4 12 -12 18" />
                <path pathLength={1} className="s5" d="M60 470 V430 H150 M280 430 H540 V470 M150 430 V470 M280 430 V470 M160 440 H270 M160 452 H270 M160 464 H270" />
                <circle pathLength={1} className="s5" cx="95" cy="415" r="14" /><circle pathLength={1} className="s5" cx="510" cy="412" r="16" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="stages relative mx-auto grid max-w-6xl grid-cols-1 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-12">
        <ol className="list-none">
          {STAGES.map((s, i) => (
            <li key={s.t} className="flex min-h-[100svh] flex-col justify-center py-24">
              <p className="text-[15px] text-cream/75">{s.n}</p>
              {i === 0
                ? <h1 className="mt-3 font-display text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.02em]">{s.t}</h1>
                : <h2 className="mt-3 font-display text-[clamp(2.75rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.02em]">{s.t}</h2>}
              <p className="mt-6 max-w-[32ch] text-lg leading-relaxed text-cream/85">{s.d}</p>
              {i === 0 && (
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href={wa('Hello KNS, I saw your website')} target="_blank" rel="noreferrer" className={glowBtn}>Talk to KNS on WhatsApp</a>
                  <a href="#packages" className={lineBtn}>See prices</a>
                </div>
              )}
              {i === 4 && (
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href={wa('Hello KNS, I would like to build a house. (Seen on your website)')} target="_blank" rel="noreferrer" className={glowBtn}>Talk to KNS</a>
                  <a href={`tel:${company.tel[0]}`} className={lineBtn}>Call {company.phones[0]}</a>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
