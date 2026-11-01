'use client';
// The entry: the KNS logo builds itself (crane drawn in gold, letters lowered into place, bricks stacked,
// tagline written in), then the world takes over and the gates open on their own. No button, no question.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useWorld } from '../lib/store';

const GOLD = '#c9a043';
const ease = [0.16, 1, 0.3, 1] as const;

export function EntryFilm() {
  const phase = useWorld((s) => s.phase), setPhase = useWorld((s) => s.setPhase);
  const loaded = useWorld((s) => s.loaded), progress = useWorld((s) => s.progress);
  const reduce = useReducedMotion();
  const [quick, setQuick] = useState(false);
  const [done, setDone] = useState(false);

  // A returning visitor gets the short cut of the film.
  useEffect(() => {
    let seen = false; try { seen = localStorage.getItem('kns-seen') === '1'; localStorage.setItem('kns-seen', '1'); } catch { /* storage may be blocked */ }
    setQuick(seen);
    if (phase === 'loading') setPhase('film');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const length = reduce ? 1400 : quick ? 2800 : 7200;
  useEffect(() => { if (phase !== 'film') return; const t = setTimeout(() => setDone(true), length); return () => clearTimeout(t); }, [phase, length]);
  useEffect(() => { if (done && loaded && phase === 'film') setPhase('entering'); }, [done, loaded, phase, setPhase]);
  // Never trap a visitor behind the loader: after 12 seconds, open anyway.
  useEffect(() => { if (!done) return; const t = setTimeout(() => { if (useWorld.getState().phase === 'film') { useWorld.getState().setLoaded(true); setPhase('entering'); } }, 12000); return () => clearTimeout(t); }, [done, setPhase]);

  const k = quick ? 0.4 : 1; // time scale
  const show = phase === 'loading' || phase === 'film';
  const draw = (delay: number, dur = 0.9) => reduce ? {} : { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { delay: delay * k, duration: dur * k, ease } };
  const drop = (delay: number) => reduce ? {} : { initial: { y: -70, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: delay * k, duration: 0.7 * k, ease: [0.34, 1.2, 0.64, 1] as const } };
  const fade = (delay: number) => reduce ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: delay * k, duration: 0.8 * k, ease } };
  const bricks: [number, number][] = [[14, 286], [46, 286], [78, 286], [30, 270], [62, 270], [14, 254], [46, 254], [78, 254], [30, 238], [62, 238], [46, 222], [78, 222], [62, 206]];

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="film" className="absolute inset-0 z-30 grid place-items-center bg-navy-950 px-6"
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : 1.1, ease } }}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(165,135,71,0.12),transparent_60%)]" />
          <motion.svg viewBox="0 0 540 370" className="relative w-[min(86vw,560px)]" role="img" aria-label="KNS Construction and Real Estate. Building dreams, brick by brick."
            animate={done && !reduce ? { scale: 0.92, opacity: 0.85 } : {}} transition={{ duration: 1.2, ease }}>
            <g fill="none" stroke={GOLD} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              {/* mast */}
              <motion.path d="M126 300 V60 M146 300 V60" {...draw(0.1, 1.1)} />
              <motion.path d="M126 300 L146 276 L126 252 L146 228 L126 204 L146 180 L126 156 L146 132 L126 108 L146 84 L126 60" strokeWidth="2" {...draw(0.5, 1.3)} />
              <motion.path d="M116 300 H156" strokeWidth="4" {...draw(0.1, 0.5)} />
              {/* peak and ties */}
              <motion.path d="M136 18 L126 60 M136 18 L146 60 M136 18 L64 62 M136 18 L330 62" strokeWidth="2.2" {...draw(1.0, 1.0)} />
              {/* jib and counter-jib */}
              <motion.path d="M60 62 H332 M70 80 H332 M60 62 L70 80" {...draw(1.2, 1.0)} />
              <motion.path d="M150 62 L162 80 L174 62 L186 80 L198 62 L210 80 L222 62 L234 80 L246 62 L258 80 L270 62 L282 80 L294 62 L306 80 L318 62 L330 80" strokeWidth="1.8" {...draw(1.6, 1.0)} />
              <motion.path d="M62 80 V96 H92 V80" strokeWidth="2.4" {...draw(1.8, 0.6)} />
              {/* cable and hook */}
              <motion.path d="M300 80 V106" strokeWidth="1.6" {...draw(2.2, 0.5)} />
              <motion.path d="M300 106 q0 9 -6 9" strokeWidth="2.4" {...draw(2.5, 0.3)} />
            </g>
            {/* bricks, laid one by one */}
            {bricks.map(([x, y], i) => (
              <motion.rect key={i} x={x} y={y} width="30" height="14" rx="1.5" fill={GOLD}
                {...(reduce ? {} : { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, transition: { delay: (2.6 + i * 0.12) * k, duration: 0.35 * k, ease } })} />
            ))}
            {/* letters lowered into place */}
            <g fill="#f3efe6" fontFamily="var(--font-display), Georgia, serif" fontWeight="600" fontSize="108">
              <motion.text x="168" y="196" {...drop(2.4)}>K</motion.text>
              <motion.text x="248" y="196" {...drop(2.8)}>N</motion.text>
              <motion.text x="330" y="196" {...drop(3.2)}>S</motion.text>
            </g>
            <g fill="#f3efe6" fontFamily="var(--font-display), Georgia, serif" fontWeight="500" fontSize="34">
              <motion.text x="170" y="242" {...fade(3.9)}>CONSTRUCTION</motion.text>
              <motion.text x="170" y="282" {...fade(4.2)}>AND REAL ESTATE</motion.text>
            </g>
            <motion.path d="M12 304 H528" stroke={GOLD} strokeWidth="1.6" {...draw(4.5, 0.9)} />
            <motion.text x="270" y="338" textAnchor="middle" fill={GOLD} fontFamily="var(--font-sans), system-ui, sans-serif" fontSize="20" letterSpacing="5" {...fade(5.0)}>
              BUILDING DREAMS, BRICK BY BRICK
            </motion.text>
          </motion.svg>

          <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-6 text-sm text-stone-50/75">
            {done && !loaded && <p role="status" className="tabular-nums">Opening the gates {progress}%</p>}
            {!done && <button type="button" onClick={() => setDone(true)} className="rounded px-3 py-2 underline decoration-white/25 underline-offset-4 transition-colors duration-150 hover:text-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400">Skip intro</button>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
