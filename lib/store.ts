'use client';
import { create } from 'zustand';
import type { Quality } from './gpu';

export type Phase = 'loading' | 'film' | 'entering' | 'explore';

export type Design = {
  plot: 150 | 200 | 300;          // square yards
  floors: 2 | 3;                  // G+1 or G+2
  pkg: 'standard' | 'premium';
  facing: 'east' | 'north' | 'west' | 'south';
  tile: number; granite: number; paint: number; door: number; // finish choices
};

export const defaultDesign: Design = { plot: 200, floors: 2, pkg: 'standard', facing: 'east', tile: 0, granite: 0, paint: 0, door: 0 };

type S = {
  phase: Phase; setPhase: (p: Phase) => void;
  loaded: boolean; setLoaded: (b: boolean) => void;
  progress: number; setProgress: (n: number) => void;
  zone: string | null; setZone: (z: string | null) => void;
  project: string | null; setProject: (p: string | null) => void;
  plot: number | null; setPlot: (n: number | null) => void;
  dusk: boolean; toggleDusk: () => void;
  quality: Quality; setQuality: (q: Quality) => void;
  notice: string | null; setNotice: (n: string | null) => void;
  pageView: boolean; setPageView: (v: boolean) => void;
  build: number; setBuild: (n: number) => void;
  design: Design; setDesign: (d: Partial<Design>) => void;
  sunHour: number | null; setSunHour: (h: number | null) => void;
  villas: boolean; setVillas: (b: boolean) => void;
  raise: boolean; setRaise: (b: boolean) => void;
  touring: boolean; setTouring: (b: boolean) => void;
  floorView: number | null; setFloorView: (n: number | null) => void;
};

export const useWorld = create<S>((set) => ({
  phase: 'loading', setPhase: (phase) => set({ phase }),
  loaded: false, setLoaded: (loaded) => set({ loaded }),
  progress: 0, setProgress: (progress) => set({ progress }),
  zone: null, setZone: (zone) => set({ zone, project: null, plot: null, sunHour: null, floorView: null }),
  project: null, setProject: (project) => set({ project }),
  plot: null, setPlot: (plot) => set({ plot }),
  dusk: false, toggleDusk: () => set((s) => ({ dusk: !s.dusk })),
  quality: 'lite', setQuality: (quality) => set({ quality }),
  notice: null, setNotice: (notice) => set({ notice }),
  pageView: false, setPageView: (pageView) => set({ pageView }),
  build: 4, setBuild: (build) => set({ build }),
  design: defaultDesign, setDesign: (d) => set((s) => ({ design: { ...s.design, ...d } })),
  sunHour: null, setSunHour: (sunHour) => set({ sunHour }),
  villas: false, setVillas: (villas) => set({ villas, plot: null }),
  raise: false, setRaise: (raise) => set({ raise }),
  touring: false, setTouring: (touring) => set({ touring }),
  floorView: null, setFloorView: (floorView) => set({ floorView }),
}));

// Built-up area and price follow KNS's own figures: about 1,400 to 1,600 sft a floor on 200 sq yd.
export const PACKAGES = {
  standard: { name: 'Standard residential', lo: 1600, hi: 1800 },
  premium: { name: 'Premium residential', lo: 1900, hi: 2200 },
} as const;
export function quote(d: Design) {
  const perFloor = Math.round((d.plot * 7.5) / 50) * 50; // 200 sq yd -> 1,500 sft
  const sft = perFloor * d.floors;
  const p = PACKAGES[d.pkg];
  return { perFloor, sft, lo: sft * p.lo, hi: sft * p.hi };
}
export const lakh = (r: number) => (r / 1e5).toLocaleString('en-IN', { maximumFractionDigits: 1 });

export const FINISHES = {
  tile: [{ name: 'Ivory vitrified', color: '#ece4d6' }, { name: 'Grey marble look', color: '#c9c9c6' }, { name: 'Warm beige', color: '#d9c3a2' }],
  granite: [{ name: 'Black galaxy', color: '#1d1c1f' }, { name: 'Tan brown', color: '#5a3b2c' }, { name: 'Steel grey', color: '#5f6165' }],
  paint: [{ name: 'Classic white', color: '#f3eee4' }, { name: 'Sand', color: '#e8d6b8' }, { name: 'Sage', color: '#c9d2bb' }, { name: 'Sky grey', color: '#d3d9df' }],
  door: [{ name: 'Teak finish', color: '#7a4b2a' }, { name: 'Walnut', color: '#4a3020' }, { name: 'White lacquer', color: '#efece6' }],
} as const;

// Plain-hash encoding so a design survives a WhatsApp share: #design-200-g1-standard-east-0-0-0-0
export function encodeDesign(d: Design) {
  return `design-${d.plot}-g${d.floors - 1}-${d.pkg}-${d.facing}-${d.tile}-${d.granite}-${d.paint}-${d.door}`;
}
export function decodeDesign(h: string): Design | null {
  const m = h.match(/^design-(150|200|300)-g([12])-(standard|premium)-(east|north|west|south)-(\d)-(\d)-(\d)-(\d)$/);
  if (!m) return null;
  return { plot: Number(m[1]) as Design['plot'], floors: (Number(m[2]) + 1) as Design['floors'], pkg: m[3] as Design['pkg'], facing: m[4] as Design['facing'],
    tile: Math.min(2, Number(m[5])), granite: Math.min(2, Number(m[6])), paint: Math.min(3, Number(m[7])), door: Math.min(3, Number(m[8])) % 3 };
}
