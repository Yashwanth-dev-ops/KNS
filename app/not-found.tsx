import { company, wa } from '../lib/content';

// Next.js exports this as 404.html, which static hosts (Netlify, Vercel, GitHub Pages) serve for any missing page.
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-6 text-center text-stone-50">
      <div className="max-w-lg">
        <p aria-label={company.name} className="font-display text-5xl font-semibold">KNS<span className="mt-1 block font-sans text-xs font-medium tracking-[0.3em] text-gold-400">CONSTRUCTION AND REAL ESTATE</span></p>
        <p className="mt-10 text-sm font-semibold text-gold-400">Error 404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">We could not find that page</h1>
        <p className="mt-4 text-stone-50/80">It may have moved, or the link has a typo. Our projects, prices and office are all on the home page.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">Go to the home page</a>
          <a href={wa('Hello KNS, a link on your website did not work.')} className="rounded-md border border-white/30 px-6 py-3 font-semibold transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">WhatsApp KNS</a>
        </div>
      </div>
    </main>
  );
}
