import Experience from '../../components/Experience';
import { Resilience } from '../../components/Resilience';
import { company, zones, projects, wa } from '../../lib/content';

export default function Page() {
  return (
    <>
      <main className="page min-h-screen bg-stone-50 text-navy-900">
        <header className="bg-navy-900 px-6 py-12 text-stone-50 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <img src="../brand/kns-logo.png" alt={company.name} width={530} height={360} className="w-64 sm:w-80" />
            <h1 className="mt-10 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Plots, turnkey homes and apartments in Hyderabad</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-50/80">Construction from ₹1,600 a square foot, materials included. {company.tagline}.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300" href={`tel:${company.tel[0]}`}>Call {company.phones[0]}</a>
              <a className="rounded-md border border-white/30 px-6 py-3 font-semibold transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300" href={wa('Hello KNS, I saw your website')}>WhatsApp</a>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-12">
          <ol className="grid gap-12">
            {zones.map((z) => (
              <li key={z.id} className="grid gap-6 border-t border-navy-900/15 pt-8 md:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="text-sm font-medium tabular-nums text-gold-600">{z.n}</p>
                  <h2 className="mt-1 font-display text-4xl font-semibold leading-tight tracking-tight">{z.title}</h2>
                  <p className="mt-4 leading-relaxed text-navy-900/75">{z.body}</p>
                  {z.photos?.map((ph) => (
                    <figure key={ph.src} className="mt-5">
                      <img src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} loading="lazy" className="w-full rounded-lg object-cover shadow-sm" />
                      <figcaption className="mt-2 text-sm text-navy-900/70">{ph.caption}</figcaption>
                    </figure>
                  ))}
                  <a className="mt-5 inline-flex rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-stone-50 transition-colors duration-150 hover:bg-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500" href={wa(z.ask)}>Ask on WhatsApp</a>
                </div>
                <dl className="divide-y divide-navy-900/10 self-start border-y border-navy-900/10">
                  {z.facts.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3"><dt className="text-navy-900/70">{k}</dt><dd className="font-medium tabular-nums">{v}</dd></div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        </div>
        <section aria-labelledby="projects-head" className="mx-auto max-w-5xl px-6 pb-16 sm:px-12">
          <h2 id="projects-head" className="font-display text-4xl font-semibold tracking-tight">Projects</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.slug}><a href={`../projects/${p.slug}/`} className="block rounded-lg border border-navy-900/15 p-4 transition-colors duration-150 hover:border-navy-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">
                <span className="block font-display text-2xl font-semibold">{p.name}</span>
                <span className="mt-1 block text-sm text-navy-900/70">{p.place}. {p.status}.</span>
              </a></li>
            ))}
          </ul>
        </section>
        <footer className="bg-navy-900 px-6 py-12 text-stone-50/80 sm:px-12">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div><p className="font-display text-2xl font-semibold text-stone-50">{company.proprietor}</p><p>Proprietor</p></div>
            <address className="not-italic leading-relaxed">{company.address.map((l) => <span key={l} className="block">{l}</span>)}</address>
            <div className="leading-relaxed">
              {company.phones.map((p, i) => <a key={p} className="block hover:text-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400" href={`tel:${company.tel[i]}`}>{p}</a>)}
              <a className="block hover:text-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400" href={`mailto:${company.email}`}>{company.email}</a>
            </div>
          </div>
          <p className="mx-auto mt-10 max-w-5xl text-sm text-stone-50/50">Prices are estimates and vary with design, location and specifications. The villa community layout is a concept, subject to survey and approvals. TS-RERA registration numbers to be added.</p>
        </footer>
      </main>
      <Experience />
      <Resilience />
    </>
  );
}
