import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { company, projects, wa } from '../../../lib/content';

export function generateStaticParams() { return projects.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const p = projects.find((x) => x.slug === slug);
  return p ? { title: `${p.name} | ${company.name}`, description: p.summary } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  const up = '../../';
  return (
    <main className="min-h-screen bg-stone-50 text-navy-900">
      <header className="bg-navy-900 px-6 py-10 text-stone-50 sm:px-12">
        <div className="mx-auto max-w-4xl">
          <a href={up} className="inline-block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"><img src={`${up}brand/kns-logo.png`} alt={company.name} width={530} height={360} className="w-44" /></a>
          <p className="mt-8 inline-block rounded-full bg-gold-500 px-3 py-1 text-sm font-semibold text-navy-950">{p.status}</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-tight tracking-tight">{p.name}</h1>
          <p className="mt-3 text-lg text-stone-50/80">{p.place}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-12 sm:px-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-lg leading-relaxed text-navy-900/80">{p.summary}</p>
          {p.photos.map((ph) => (
            <figure key={ph.src} className="mt-6">
              <img src={`${up}${ph.src}`} alt={ph.alt} width={ph.w} height={ph.h} className="w-full rounded-lg shadow-sm" />
              <figcaption className="mt-2 text-sm text-navy-900/70">{ph.caption}</figcaption>
            </figure>
          ))}
          {p.photos.length === 0 && <p className="mt-6 text-sm text-navy-900/70">Photos of this project will be added soon.</p>}
        </div>
        <div>
          <dl className="divide-y divide-navy-900/10 border-y border-navy-900/10">
            {p.facts.map(([k, v]) => <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 py-3"><dt className="text-navy-900/70">{k}</dt><dd className="font-medium">{v}</dd></div>)}
          </dl>
          <div className="mt-6 grid gap-2">
            <a href={wa(`Hello KNS, I want to know about ${p.name}. (Seen on the KNS website)`)} className="rounded-md bg-gold-500 px-5 py-3 text-center font-semibold text-navy-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600">Ask on WhatsApp</a>
            <a href={`${up}#${p.slug}`} className="rounded-md bg-navy-900 px-5 py-3 text-center font-semibold text-stone-50 transition-colors duration-150 hover:bg-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">See it in 3D</a>
            <a href={p.maps} className="rounded-md border border-navy-900/20 px-5 py-3 text-center font-semibold transition-colors duration-150 hover:bg-navy-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">Directions</a>
          </div>
          <p className="mt-6 text-sm text-navy-900/70">{company.phones.join(', ')}. {company.address.join(', ')}.</p>
        </div>
      </div>
    </main>
  );
}
