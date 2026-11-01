import type { Metadata } from 'next';
import HouseViewer from '../../components/house/HouseViewer';
import { Resilience } from '../../components/Resilience';
import { company } from '../../lib/content';

export const metadata: Metadata = {
  title: `Walk through a KNS G+1 in 3D | ${company.name}`,
  description: 'Turn the house, lift the roof off and step into the living room, kitchen and bedroom.',
};

export default function HousePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-navy-900">
      <header className="bg-navy-900 px-6 py-8 text-stone-50 sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6">
          <div>
            <a href="../" className="inline-block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-400"><img src="../brand/kns-logo.png" alt={company.name} width={530} height={360} className="w-36" /></a>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Look inside a KNS G+1</h1>
          </div>
          <p className="max-w-sm text-stone-50/80">Built from our design renders. Room layout is indicative.</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-12"><HouseViewer /></div>
      <Resilience />
    </main>
  );
}
