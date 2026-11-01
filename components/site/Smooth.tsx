'use client';
// Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in step. Off for reduced motion.
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
let lenis: Lenis | null = null;

export function Smooth({ paused }: { paused: boolean }) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; };
  }, []);
  // No scrolling behind the intro.
  useEffect(() => {
    if (paused) lenis?.stop(); else lenis?.start();
    document.documentElement.style.overflow = paused ? 'hidden' : '';
  }, [paused]);
  return null;
}
