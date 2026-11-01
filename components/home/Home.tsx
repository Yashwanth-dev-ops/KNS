'use client';
// The KNS homepage: the logo intro, then the house rising out of the clouds and "KNS" filled with it,
// then calm, editorial sections. Motion is GSAP ScrollTrigger on Lenis; everything still reads with motion off.
import './home.css';
import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Intro } from '../site/Intro';
import { BottomBar } from '../site/BottomBar';
import { company, wa } from '../../lib/content';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WA = wa('Hello KNS, I saw your website and would like to talk about building a home.');
const VISIT = wa('Hello KNS, I would like to book a site visit. (Seen on your website)');
const Arrow = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
const BigArrow = () => <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M0 20h76M58 2l18 18-18 18" /></svg>;

// The reference site's button: the label rolls up and a copy rolls in from below, the pill stretches with a spring.
function Pill({ href, children, tone = '', arrow = true, external = true }: { href: string; children: string; tone?: string; arrow?: boolean; external?: boolean }) {
  return (
    <a className={`pill ${tone}`} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <span className="roll"><span data-text={children}>{children}</span></span>
      {arrow && <Arrow />}
    </a>
  );
}
const Words = ({ text }: { text: string }) => <>{text.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}</>;

const SERVICES = [
  { word: 'Build', img: 'photos/design/exterior.jpg', href: WA, d: 'Turnkey construction on your plot, from ₹1,600 a sq ft with materials included.' },
  { word: 'Buy', img: 'photos/real/front-elevation.jpg', href: 'projects/kondapur-duplex/', d: 'A ready-to-move, east-facing G+1 duplex in Kondapur and 3BHK flats in Raghavendra Colony.' },
  { word: 'Plots', img: 'brand/villa-layout.jpg', href: 'projects/ganapatiguda-villas/', d: 'Villa plots in a planned Ganapatiguda community, and open plots across Hyderabad.' },
];
const CARDS = [
  { t: ['G+1 duplex,', 'Kondapur'], img: 'photos/real/front-elevation.jpg', href: 'projects/kondapur-duplex/' },
  { t: ['3BHK apartments,', 'Raghavendra Colony'], img: 'photos/design/exterior.jpg', href: 'projects/raghavendra-colony-apartments/' },
  { t: ['Villa plots,', 'Ganapatiguda'], img: 'brand/villa-layout.jpg', href: 'projects/ganapatiguda-villas/' },
];

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useGSAP(() => {
    const bar = root.current!.querySelector('.bar')!;
    const onScroll = () => bar.classList.toggle('solid', scrollY > innerHeight * 2.3);
    addEventListener('scroll', onScroll, { passive: true });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => removeEventListener('scroll', onScroll);
    root.current!.dataset.motion = 'on'; // reveal styles only apply once motion is running

    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    if (!ready) lenis.stop();

    // The house rises out of the clouds, "KNS" is drawn over it, then filled with it as the clouds roll in.
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=260%', pin: true, scrub: 1 } })
      .to('.hero .copy', { y: -80, opacity: 0, duration: 0.25 }, 0)
      .fromTo('.hero .house', { y: 0, scale: 1 }, { y: () => -innerHeight * 0.42, scale: 1.12, duration: 0.55, ease: 'power1.out' }, 0)
      .to('.hero .front', { yPercent: -22, duration: 0.6 }, 0).to('.hero .back', { yPercent: -12, duration: 0.6 }, 0)
      .to('.logo-out', { opacity: 1, duration: 0.15 }, 0.3)
      .to('.hero .house', { opacity: 0, duration: 0.25 }, 0.6).to('.logo-out', { opacity: 0, duration: 0.2 }, 0.62).to('.logo-fill', { opacity: 1, duration: 0.25 }, 0.6)
      .to('.hero .front', { yPercent: -34, duration: 0.4 }, 0.6).to({}, { duration: 0.2 });
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((p) => gsap.to(p.querySelectorAll('.w'), { color: 'var(--ink)', stagger: 0.06, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } }));
    gsap.utils.toArray<HTMLElement>('.rv').forEach((e) => gsap.to(e, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 88%' } }));
    gsap.fromTo('.band img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.steps-img figure', { x: -120, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.steps-img', start: 'top 80%' } });
    return () => { removeEventListener('scroll', onScroll); gsap.ticker.remove(tick); lenis.destroy(); };
  }, { scope: root, dependencies: [ready], revertOnUpdate: true });

  return (
    <div ref={root} className="home">
      <Intro onDone={() => setReady(true)} />
      <header className="bar">
        <a className="brand" href="#main" data-header-logo aria-label={`${company.name}, home`}>KNS</a>
        <nav className="nav" aria-label="Main"><a href="#why">Why KNS</a><a href="#services">Build and buy</a><a href="#projects">Projects</a><a href="#contact">Contact</a></nav>
        <Pill href={WA} arrow={false}>Talk to KNS</Pill>
      </header>

      <main id="main">
        <section className="hero" aria-label={company.name}>
          <img className="back" src="home/clouds-back.png" alt="" />
          <img className="house" src="home/house-cut.png" alt="Design render of a KNS G+1 house" />
          <img className="front" src="home/clouds-front.png" alt="" />
          <div className="copy">
            <h1>Homes Built Brick by Brick</h1>
            <p className="sub">Turnkey G+1 houses in Hyderabad. <span>Real materials, one contract, plan to keys.</span></p>
            <Pill href={WA}>Plan your home</Pill>
          </div>
          <div className="logo-out" aria-hidden="true"><div className="stack"><div className="big">KNS</div><span className="small">Construction and Real Estate</span></div></div>
          <div className="logo-fill" aria-hidden="true"><div className="stack">
            <div className="big" style={{ backgroundImage: 'url(photos/design/exterior.jpg)' }}>KNS</div>
            <span className="small" style={{ backgroundImage: 'url(photos/design/exterior.jpg)' }}>Construction and Real Estate</span>
          </div></div>
        </section>

        <section className="why" id="why">
          <div className="wrap grid2">
            <p className="label">Why KNS</p>
            <p className="tone reveal"><Words text="Building a home is the biggest thing most families ever do. We make it simple: one team, one contract, from the first drawing to the day you get the keys." /></p>
          </div>
          <div className="band"><img src="photos/real/front-elevation.jpg" alt="A finished KNS G+1 house in Hyderabad" /></div>
        </section>

        <section className="notjust"><div className="wrap">
          <h2 className="rv">This isn&apos;t just construction. <span>It&apos;s home.</span></h2>
          <div className="steps-img" aria-hidden="true">
            {['photos/real/entrance-porch.jpg', 'photos/design/living.jpg', 'photos/design/kitchen.jpg', 'photos/design/bedroom.jpg'].map((src) => <figure key={src} style={{ backgroundImage: `url(${src})` }} />)}
          </div>
          <p className="tone reveal"><Words text="It is the porch your children run across, the kitchen that fits your family, the room you finally call your own. We build it like it is ours." /></p>
        </div></section>

        <section className="keys"><div className="wrap grid2">
          <div><h2 className="rv">Plan to keys, <span>simply.</span></h2><Pill href={VISIT}>Book a site visit</Pill></div>
          <ol>
            <li className="rv"><small>01</small><div>Visit your plot. <span>We look at the land, the facing and your budget, then plan with Vastu in mind.</span></div></li>
            <li className="rv"><small>02</small><div>See it in 3D. <span>Your elevation and rooms, designed and approved before a single brick.</span></div></li>
            <li className="rv"><small>03</small><div>Move in. <span>Structure, walls, finishing, all with branded materials. You get the keys.</span></div></li>
          </ol>
        </div></section>

        <section className="svc" id="services">
          <div className="wrap head"><div /><h2 className="rv">How KNS <span>can help you</span></h2></div>
          {SERVICES.map((s, i) => (
            <a className="row" key={s.word} href={s.href} {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <div className="bg" style={{ backgroundImage: `url(${s.img})` }} />
              <div className="d"><i>{i + 1}</i>{s.d}</div>
              <div className="word">{s.word}<BigArrow /></div>
            </a>
          ))}
        </section>

        <section className="cards" id="projects"><div className="wrap">
          <div className="grid2"><h2 className="rv">Projects <span>in Hyderabad</span></h2><p className="intro-line">Ready homes, apartments and plots, each one built and sold by KNS directly.</p></div>
          <div className="grid3">
            {CARDS.map((c) => (
              <article className="card rv" key={c.href} style={{ backgroundImage: `url(${c.img})` }}>
                <h3>{c.t[0]}<br />{c.t[1]}</h3>
                <Pill href={c.href} tone="light" external={false}>Details</Pill>
              </article>
            ))}
          </div>
          <p className="note">Interior and elevation images are design renders. The villa layout is a concept plan.</p>
        </div></section>

        <section className="cta" id="contact" style={{ backgroundImage: 'url(photos/design/living.jpg)' }}>
          <div><h2>Your plot. <span>Our bricks.</span></h2><Pill href={WA} tone="light">Talk to KNS on WhatsApp</Pill></div>
        </section>
      </main>

      <footer className="foot"><div className="wrap">
        <div className="fgrid">
          <div><p className="k">Office</p>{company.address[0]}<br />{company.address[1]}</div>
          <div><p className="k">Call</p>{company.phones.map((p, i) => <a key={p} href={`tel:${company.tel[i]}`}>{p}<br /></a>)}</div>
          <div><p className="k">Email</p><a href={`mailto:${company.email}`}>{company.email}</a><p className="k mt">Proprietor</p>{company.proprietor}</div>
        </div>
        <div className="fbig" aria-hidden="true">KNS</div>
        <div className="legal"><span>{company.name}</span><span>Prices are estimates and vary with design, location and specifications.</span></div>
      </div></footer>
      <BottomBar />
    </div>
  );
}
