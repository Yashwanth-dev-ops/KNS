'use client';
// The entrance: the KNS logo builds itself (crane drawn, K N S lowered in, bricks laid, tagline),
// then it flies into the header and the website opens. Plays on every load; skippable.
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// The build runs in CSS (globals.css, "Logo intro") so it starts on the first painted frame, before any JS loads.
// JS only waits for it to end, then flies the logo into the header. Times are seconds from first paint.
const GOLD = 'var(--c-gold)', INK = 'var(--c-cream)';
const BRICKS: [number, number][] = [[14, 286], [46, 286], [78, 286], [30, 270], [62, 270], [14, 254], [46, 254], [78, 254], [30, 238], [62, 238], [46, 222], [78, 222], [62, 206]];
const at = (t: number) => ({ ['--t' as string]: `${t.toFixed(2)}s` }) as React.CSSProperties;

export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const [show, setShow] = useState(true);

  // Fly the logo into the header's logo, lift the curtain, open the site. Runs once, from the end or from Skip.
  const leave = () => {
    if (leaving.current || !root.current) return;
    leaving.current = true;
    root.current.getAnimations?.({ subtree: true }).forEach((a) => a.finish());
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const logo = root.current.querySelector('.intro-logo');
    const to = document.querySelector('[data-header-logo]')?.getBoundingClientRect();
    const from = logo?.getBoundingClientRect();
    const finish = () => { setShow(false); onDone(); };
    if (reduce || !to || !from || !logo) { gsap.to(root.current, { opacity: 0, duration: 0.4, onComplete: finish }); return; }
    gsap.timeline({ onComplete: finish })
      .to(logo, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.width / from.width, duration: 1.1, ease: 'power3.inOut' })
      .to(root.current, { backgroundColor: 'rgba(6,8,13,0)', duration: 0.6 }, '-=0.5')
      .to([logo, root.current.querySelector('.intro-skip')], { opacity: 0, duration: 0.25 });
  };

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { const t = setTimeout(leave, 1000); return () => clearTimeout(t); }
    const last = root.current?.querySelector('.tagline')?.getAnimations?.()[0];
    let t: ReturnType<typeof setTimeout>;
    if (last) last.finished.then(() => { t = setTimeout(leave, 600); }, () => {});
    else t = setTimeout(leave, 7000); // shortcut: browsers without getAnimations get a fixed wait, fine for the few that lack it
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;
  return (
    <div ref={root} className="intro fixed inset-0 z-[100] place-items-center bg-night px-6">
      <svg viewBox="0 0 540 370" className="intro-logo w-[min(64vw,340px)]" role="img" aria-label="KNS Construction and Real Estate. Building dreams, brick by brick.">
        <g fill="none" stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path pathLength={1} style={at(0.00)} className="crane" d="M126 300 V60 M146 300 V60" />
          <path pathLength={1} style={at(0.16)} className="crane" strokeWidth="2" d="M126 300 L146 276 L126 252 L146 228 L126 204 L146 180 L126 156 L146 132 L126 108 L146 84 L126 60" />
          <path pathLength={1} style={at(0.32)} className="crane" strokeWidth="4" d="M116 300 H156" />
          <path pathLength={1} style={at(0.48)} className="crane" strokeWidth="2.2" d="M136 18 L126 60 M136 18 L146 60 M136 18 L64 62 M136 18 L330 62" />
          <path pathLength={1} style={at(0.64)} className="crane" d="M60 62 H332 M70 80 H332 M60 62 L70 80" />
          <path pathLength={1} style={at(0.80)} className="crane" strokeWidth="1.8" d="M150 62 L162 80 L174 62 L186 80 L198 62 L210 80 L222 62 L234 80 L246 62 L258 80 L270 62 L282 80 L294 62 L306 80 L318 62 L330 80" />
          <path pathLength={1} style={at(0.96)} className="crane" strokeWidth="2.4" d="M62 80 V96 H92 V80" />
          <path pathLength={1} style={at(2.16)} className="hook" strokeWidth="1.6" d="M300 80 V106 q0 9 -6 9" />
        </g>
        {BRICKS.map(([x, y], i) => <rect key={i} style={at(2.3 + i * 0.09)} className="brick" x={x} y={y} width="30" height="14" rx="1.5" fill={GOLD} />)}
        <g fill={INK} fontFamily="var(--font-display), Georgia, serif" fontWeight="600" fontSize="108">
          <text style={at(3.00)} className="letter" x="168" y="196">K</text>
          <text style={at(3.29)} className="letter" x="248" y="196">N</text>
          <text style={at(3.58)} className="letter" x="330" y="196">S</text>
        </g>
        <g fill={INK} fontFamily="var(--font-display), Georgia, serif" fontWeight="500" fontSize="34">
          <text style={at(4.27)} className="word" x="170" y="242">CONSTRUCTION</text>
          <text style={at(4.47)} className="word" x="170" y="282">AND REAL ESTATE</text>
        </g>
        <path style={at(4.87)} className="rule" d="M12 304 H528" stroke={GOLD} strokeWidth="1.6" />
        <text style={at(5.27)} className="tagline" x="270" y="338" textAnchor="middle" fill={GOLD} fontFamily="var(--font-sans), system-ui, sans-serif" fontSize="20" letterSpacing="5">BUILDING DREAMS, BRICK BY BRICK</text>
      </svg>
      <button type="button" onClick={leave} className="intro-skip absolute bottom-8 left-1/2 -translate-x-1/2 rounded px-3 py-2 text-sm text-cream/75 underline decoration-cream/25 underline-offset-4 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream">Skip intro</button>
    </div>
  );
}
