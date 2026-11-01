// Phones only: calling or WhatsApp-ing KNS is always one tap away.
import { company, wa } from '../../lib/content';

const b = 'flex min-h-12 flex-1 items-center justify-center rounded-full font-semibold transition-transform duration-100 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream';

export function BottomBar() {
  return (
    <nav data-bottom-bar aria-label="Contact KNS" className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-cream/10 bg-night/90 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <a href={`tel:${company.tel[0]}`} className={`${b} bg-cream/10 text-cream`}>Call</a>
      <a href={wa('Hello KNS, I saw your website')} target="_blank" rel="noreferrer" className={`${b} bg-glow text-night`}>WhatsApp</a>
    </nav>
  );
}
