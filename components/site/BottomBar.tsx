// Phones only: calling or WhatsApp-ing KNS is always one tap away.
import { company, wa } from '../../lib/content';

const b = 'flex min-h-12 flex-1 items-center justify-center rounded-md font-semibold text-lime transition-transform duration-100 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick';

export function BottomBar() {
  return (
    <nav data-bottom-bar aria-label="Contact KNS" className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-charcoal/10 bg-lime/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
      <a href={`tel:${company.tel[0]}`} className={`${b} bg-charcoal`}>Call</a>
      <a href={wa('Hello KNS, I saw your website')} target="_blank" rel="noreferrer" className={`${b} bg-brick`}>WhatsApp</a>
    </nav>
  );
}
