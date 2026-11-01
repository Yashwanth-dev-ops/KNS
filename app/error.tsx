'use client';
import { useEffect } from 'react';
import { company, wa } from '../lib/content';

// Shown if something on the page crashes: the visitor can retry, read the plain page, or contact KNS.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-navy-950 px-6 text-center text-stone-50" role="alert">
      <div className="max-w-lg">
        <p className="text-sm font-semibold text-gold-400">Something went wrong</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">This page hit a problem</h1>
        <p className="mt-4 text-stone-50/80">Try again. If it keeps happening, KNS is one message away.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">Try again</button>
          <a href={wa('Hello KNS, your website showed me an error.')} className="rounded-md border border-white/30 px-6 py-3 font-semibold transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">WhatsApp KNS</a>
          <a href={`tel:${company.tel[0]}`} className="rounded-md border border-white/30 px-6 py-3 font-semibold transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">Call {company.phones[0]}</a>
        </div>
      </div>
    </main>
  );
}
