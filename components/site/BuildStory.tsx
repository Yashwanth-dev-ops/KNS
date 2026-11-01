'use client';
// The logo's idea carried through the page: a G+1 drawn in gold line, stage by stage, as you scroll,
// ending on the design render it was drawn from. No JS or reduced motion: the finished drawing and the list.
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

const STAGES: [string, string][] = [
  ['Plan and design', '2D plans and 3D elevations, Vastu-aware, before a single brick.'],
  ['Foundation', 'Excavation, footings and an RCC plinth in premium cement.'],
  ['Structure', 'TMT steel columns, beams and slabs, floor by floor.'],
  ['Walls and services', 'Red brick masonry, plaster, concealed wiring and plumbing.'],
  ['Finishing and handover', 'Elevation, tiles, granite, doors and paint. You get the keys.'],
];

export default function BuildStory() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const el = root.current!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.dataset.anim = 'on';
    gsap.set('.cap:not(:first-child)', { opacity: 0, y: 16 });
    const t = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
    for (let i = 1; i <= 5; i++) {
      if (i > 1) t.to(`.cap:nth-child(${i - 1})`, { opacity: 0, y: -16, duration: 0.3 }).to(`.cap:nth-child(${i})`, { opacity: 1, y: 0, duration: 0.3 }, '<');
      t.fromTo(`.s${i}`, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, stagger: 0.04 }, '<')
        .to('.tick', { scaleX: i / 5, duration: 0.3 }, '<');
    }
    t.to('.render', { opacity: 1, duration: 0.8 }).to('.render-cap', { opacity: 1, duration: 0.3 }, '<').to({}, { duration: 0.4 });
  }, { scope: root });

  const G = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <section id="process" ref={root} aria-labelledby="build-h" className="group bg-navy-950 text-stone-50 data-[anim=on]:h-[460vh]">
      <div className="mx-auto grid max-w-6xl content-center gap-8 px-4 py-20 sm:px-6 group-data-[anim=on]:sticky group-data-[anim=on]:top-0 group-data-[anim=on]:h-screen group-data-[anim=on]:py-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <h2 id="build-h" className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">From a line on paper to your front door</h2>
          <div aria-hidden="true" className="mt-6 h-px w-full max-w-sm bg-white/15"><div className="tick h-px w-full origin-left bg-gold-400 group-data-[anim=on]:scale-x-0" /></div>
          <ol className="mt-6 grid gap-6 group-data-[anim=on]:gap-0">
            {STAGES.map(([t, d], i) => (
              <li key={t} className="cap group-data-[anim=on]:[grid-area:1/1]">
                <p className="text-sm tabular-nums text-gold-300">Stage {i + 1} of 5</p>
                <h3 className="mt-1 font-display text-3xl font-semibold">{t}</h3>
                <p className="mt-2 max-w-md text-stone-50/75">{d}</p>
              </li>
            ))}
          </ol>
        </div>

        <figure className="relative mx-auto w-full max-w-xl">
          <svg viewBox="0 0 600 520" className="w-full text-gold-400" role="img" aria-label="Line drawing of a G+1 house, built up stage by stage">
            <g {...G} strokeWidth="1" strokeDasharray="4 6" opacity="0.5">
              {[100, 200, 300, 400, 500].map((x) => <path key={x} className="s1" d={`M${x} 90 V505`} />)}
              {[180, 330, 470].map((y) => <path key={y} className="s1" d={`M40 ${y} H560`} />)}
            </g>
            <g {...G} strokeWidth="1.6">
              <path className="s1" d="M30 470 H570" />
              <path className="s1" d="M140 500 V510 M460 500 V510 M140 505 H460" />
              <path className="s2" d="M128 470 V500 H172 V470 M278 470 V500 H322 V470 M428 470 V500 H472 V470" />
              <path className="s2" d="M136 470 V455 H464 V470" />
              <path className="s3" strokeWidth="2.4" d="M150 455 V180 M300 455 V200 M450 455 V200" />
              <path className="s3" strokeWidth="2.4" d="M140 330 H460 M140 200 H460 M150 180 H250" />
              <path className="s4" d="M140 455 V200 M460 455 V200 M250 200 V120 H150 V180" />
              <path className="s4" d="M140 195 H460 V182 H250 M140 195 V182 H150" />
              <path className="s4" d="M315 360 H385 V420 H315 Z M350 360 V420 M175 350 H250 V455 M360 230 H400 V290 H360 Z" />
              <path className="s5" strokeWidth="3" d="M120 212 H332 V318 H120 Z M132 222 H320 V308" />
              <path className="s5" d="M140 285 H320 M140 296 H320" />
              {[404, 414, 424, 434, 444].map((x) => <path key={x} className="s5" d={`M${x} 200 V455`} />)}
              <path className="s5" d="M200 155 V140 M200 140 q-14 -6 -10 -18 q10 2 10 18 q2 -16 12 -18 q4 12 -12 18" />
              <path className="s5" d="M60 470 V430 H150 M280 430 H540 V470 M150 430 V470 M280 430 V470 M160 440 H270 M160 452 H270 M160 464 H270" />
              <circle className="s5" cx="95" cy="415" r="14" /><circle className="s5" cx="510" cy="412" r="16" />
            </g>
          </svg>
          <img src="photos/design/exterior.jpg" alt="" width={1024} height={1024} loading="lazy"
            className="render pointer-events-none absolute inset-0 hidden h-full w-full rounded-xl object-cover opacity-0 group-data-[anim=on]:block" />
          <figcaption className="render-cap mt-3 text-sm text-stone-50/70 group-data-[anim=on]:opacity-0">The finished elevation, as a design render. KNS draws yours in 3D before work starts.</figcaption>
        </figure>
      </div>
    </section>
  );
}
