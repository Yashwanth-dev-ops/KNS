'use client';
// The entrance: the KNS logo builds itself (crane drawn, K N S lowered in, bricks laid, tagline),
// then it flies into the header and the website opens. Once per browser session; skippable.
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);
const BRICK = 'var(--c-brick)', INK = 'var(--c-charcoal)', GOLD = 'var(--c-gold)';
const BRICKS: [number, number][] = [[14, 286], [46, 286], [78, 286], [30, 270], [62, 270], [14, 254], [46, 254], [78, 254], [30, 238], [62, 238], [46, 222], [78, 222], [62, 206]];

export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const build = useRef<gsap.core.Timeline | null>(null);
  const leaving = useRef(false);
  const [show, setShow] = useState(true);

  // Fly the logo into the header's logo, lift the curtain, open the site. Runs once, from the end or from Skip.
  const leave = () => {
    if (leaving.current || !root.current) return;
    leaving.current = true;
    build.current?.progress(1).kill();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const logo = root.current.querySelector('.intro-logo');
    const to = document.querySelector('[data-header-logo]')?.getBoundingClientRect();
    const from = logo?.getBoundingClientRect();
    const finish = () => { setShow(false); onDone(); };
    if (reduce || !to || !from || !logo) { gsap.to(root.current, { opacity: 0, duration: 0.4, onComplete: finish }); return; }
    gsap.timeline({ onComplete: finish })
      .to(logo, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.width / from.width, duration: 1.2, ease: 'power3.inOut' })
      .to(root.current, { backgroundColor: 'rgba(243,237,226,0)', duration: 0.6 }, '-=0.5')
      .to([logo, root.current.querySelector('.intro-skip')], { opacity: 0, duration: 0.25 });
  };

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('kns-intro') === '1'; sessionStorage.setItem('kns-intro', '1'); } catch { /* storage blocked */ }
    if (seen) { setShow(false); onDone(); return; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: leave });
      if (reduce) t.from('.intro-logo', { opacity: 0, duration: 0.4 }).to({}, { duration: 0.8 });
      else t.from('.crane', { drawSVG: '0%', duration: 1.1, stagger: 0.12, ease: 'power2.inOut' })
        .from('.hook', { drawSVG: '0%', duration: 0.4 }, '-=0.2')
        .from('.brick', { y: -14, opacity: 0, duration: 0.3, stagger: 0.07 }, '-=0.3')
        .from('.letter', { y: -80, opacity: 0, duration: 0.7, stagger: 0.22, ease: 'back.out(1.6)' }, '-=0.6')
        .from('.word', { y: 10, opacity: 0, duration: 0.6, stagger: 0.15 }, '-=0.2')
        .from('.rule', { drawSVG: '50% 50%', duration: 0.7 }, '-=0.3')
        .from('.tagline', { opacity: 0, letterSpacing: '0px', duration: 0.9 }, '-=0.4')
        .to({}, { duration: 0.5 });
      if (!reduce) t.timeScale(0.75); // the build read as rushed on phones
      build.current = t;
    }, root);
    return () => ctx.revert();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;
  return (
    <div ref={root} className="intro fixed inset-0 z-[100] place-items-center bg-lime px-6">
      <svg viewBox="0 0 540 370" className="intro-logo w-[min(86vw,560px)]" role="img" aria-label="KNS Construction and Real Estate. Building dreams, brick by brick.">
        <g fill="none" stroke={BRICK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path className="crane" d="M126 300 V60 M146 300 V60" />
          <path className="crane" strokeWidth="2" d="M126 300 L146 276 L126 252 L146 228 L126 204 L146 180 L126 156 L146 132 L126 108 L146 84 L126 60" />
          <path className="crane" strokeWidth="4" d="M116 300 H156" />
          <path className="crane" strokeWidth="2.2" d="M136 18 L126 60 M136 18 L146 60 M136 18 L64 62 M136 18 L330 62" />
          <path className="crane" d="M60 62 H332 M70 80 H332 M60 62 L70 80" />
          <path className="crane" strokeWidth="1.8" d="M150 62 L162 80 L174 62 L186 80 L198 62 L210 80 L222 62 L234 80 L246 62 L258 80 L270 62 L282 80 L294 62 L306 80 L318 62 L330 80" />
          <path className="crane" strokeWidth="2.4" d="M62 80 V96 H92 V80" />
          <path className="hook" strokeWidth="1.6" d="M300 80 V106 q0 9 -6 9" />
        </g>
        {BRICKS.map(([x, y], i) => <rect key={i} className="brick" x={x} y={y} width="30" height="14" rx="1.5" fill={BRICK} />)}
        <g fill={INK} fontFamily="var(--font-display), Georgia, serif" fontWeight="600" fontSize="108">
          <text className="letter" x="168" y="196">K</text>
          <text className="letter" x="248" y="196">N</text>
          <text className="letter" x="330" y="196">S</text>
        </g>
        <g fill={INK} fontFamily="var(--font-display), Georgia, serif" fontWeight="500" fontSize="34">
          <text className="word" x="170" y="242">CONSTRUCTION</text>
          <text className="word" x="170" y="282">AND REAL ESTATE</text>
        </g>
        <path className="rule" d="M12 304 H528" stroke={GOLD} strokeWidth="1.6" />
        <text className="tagline" x="270" y="338" textAnchor="middle" fill={GOLD} fontFamily="var(--font-sans), system-ui, sans-serif" fontSize="20" letterSpacing="5">BUILDING DREAMS, BRICK BY BRICK</text>
      </svg>
      <button type="button" onClick={leave} className="intro-skip absolute bottom-8 left-1/2 -translate-x-1/2 rounded px-3 py-2 text-sm text-charcoal/75 underline decoration-charcoal/25 underline-offset-4 hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-brick">Skip intro</button>
    </div>
  );
}
