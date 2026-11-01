'use client';
// Procedural, seeded textures painted on canvases at load time: no texture downloads.
import * as THREE from 'three';

let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function canvas(size: number, paint: (x: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d')!; paint(x, size); return c;
}
function noise(x: CanvasRenderingContext2D, s: number, base: string, specks: [string, number][], n = 9000, r = 1.4) {
  x.fillStyle = base; x.fillRect(0, 0, s, s);
  for (const [col, share] of specks) {
    x.fillStyle = col;
    for (let i = 0; i < n * share; i++) { x.globalAlpha = 0.25 + rand() * 0.5; x.fillRect(rand() * s, rand() * s, r * (0.5 + rand()), r * (0.5 + rand())); }
  }
  x.globalAlpha = 1;
}
function tex(c: HTMLCanvasElement, repeat: [number, number], color = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const painters: Record<string, (x: CanvasRenderingContext2D, s: number) => void> = {
  grass: (x, s) => {
    noise(x, s, '#5f7a3c', [['#4c6631', 0.6], ['#73904a', 0.5], ['#83995a', 0.2], ['#3d5427', 0.3]], 26000, 1.6);
  },
  asphalt: (x, s) => noise(x, s, '#3b3e44', [['#2c2f34', 0.6], ['#55585e', 0.5], ['#6b6d72', 0.1]], 30000, 1.2),
  concrete: (x, s) => noise(x, s, '#b9b7b0', [['#a6a49d', 0.6], ['#cac8c1', 0.5], ['#8f8d87', 0.12]], 22000, 1.3),
  plaster: (x, s) => noise(x, s, '#ece7dc', [['#e1dbcf', 0.5], ['#f4f0e8', 0.5]], 14000, 1.6),
  soil: (x, s) => noise(x, s, '#8a6a49', [['#75583b', 0.6], ['#9e7e5a', 0.5], ['#5f4630', 0.2]], 26000, 1.8),
  paving: (x, s) => {
    x.fillStyle = '#8f8a82'; x.fillRect(0, 0, s, s);
    const n = 8, w = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 128 + Math.floor(rand() * 26); x.fillStyle = `rgb(${v + 22},${v + 16},${v + 8})`;
      x.fillRect(i * w + 2, j * w + 2, w - 4, w - 4);
    }
  },
  brick: (x, s) => {
    x.fillStyle = '#bdb5a8'; x.fillRect(0, 0, s, s);
    const rows = 16, h = s / rows, bw = s / 4;
    for (let r = 0; r < rows; r++) for (let b = -1; b < 5; b++) {
      const off = r % 2 ? bw / 2 : 0;
      const t = rand(); x.fillStyle = `rgb(${150 + t * 40},${62 + t * 22},${44 + t * 14})`;
      x.fillRect(b * bw + off + 2, r * h + 2, bw - 4, h - 4);
    }
  },
  tiles: (x, s) => {
    x.fillStyle = '#d9d2c4'; x.fillRect(0, 0, s, s);
    const n = 4, w = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = 226 + Math.floor(rand() * 10); x.fillStyle = `rgb(${v},${v - 4},${v - 12})`;
      x.fillRect(i * w + 1.5, j * w + 1.5, w - 3, w - 3);
    }
  },
  granite: (x, s) => noise(x, s, '#2b2a2c', [['#4a4648', 0.5], ['#6e6668', 0.25], ['#151416', 0.4], ['#a39a90', 0.05]], 30000, 1.4),
  teak: (x, s) => {
    x.fillStyle = '#7a4b2a'; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i++) { x.strokeStyle = rand() > 0.5 ? 'rgba(60,32,16,0.35)' : 'rgba(150,96,56,0.3)'; x.lineWidth = 1 + rand() * 2; const y = rand() * s; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(s * 0.3, y + rand() * 8 - 4, s * 0.6, y + rand() * 8 - 4, s, y); x.stroke(); }
  },
};

// From KNS's design renders: white marble with grey veins, the chevron wardrobe, the jaali screen, the tree emblem.
Object.assign(painters, {
  marble: (x: CanvasRenderingContext2D, s: number) => {
    x.fillStyle = '#efece6'; x.fillRect(0, 0, s, s);
    for (let i = 0; i < 14; i++) {
      x.strokeStyle = `rgba(110,110,118,${0.12 + rand() * 0.25})`; x.lineWidth = 0.6 + rand() * 1.6;
      let px = rand() * s, py = 0; x.beginPath(); x.moveTo(px, py);
      while (py < s) { px += (rand() - 0.5) * 40; py += 10 + rand() * 30; x.lineTo(px, py); }
      x.stroke();
    }
    x.strokeStyle = 'rgba(160,160,165,0.35)'; x.lineWidth = 1; x.strokeRect(0, 0, s, s);
  },
  chevron: (x: CanvasRenderingContext2D, s: number) => {
    x.fillStyle = '#f1eee8'; x.fillRect(0, 0, s, s);
    x.strokeStyle = '#5a3a26'; x.lineWidth = s * 0.05;
    x.beginPath(); x.moveTo(0, s * 0.5); x.lineTo(s * 0.5, s * 0.36); x.lineTo(s, s * 0.5); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,0.15)'; x.lineWidth = 2; x.beginPath(); x.moveTo(s * 0.5, 0); x.lineTo(s * 0.5, s); x.stroke();
  },
  jaali: (x: CanvasRenderingContext2D, s: number) => {
    x.fillStyle = '#1b1d22'; x.fillRect(0, 0, s, s);
    x.fillStyle = '#d9d2c4';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const cx = (i + 0.5) * s / 4, cy = (j + 0.5) * s / 4, r = s / 11;
      x.beginPath(); x.ellipse(cx, cy - r * 0.6, r * 0.35, r * 0.7, 0, 0, Math.PI * 2); x.ellipse(cx, cy + r * 0.6, r * 0.35, r * 0.7, 0, 0, Math.PI * 2);
      x.ellipse(cx - r * 0.6, cy, r * 0.7, r * 0.35, 0, 0, Math.PI * 2); x.ellipse(cx + r * 0.6, cy, r * 0.7, r * 0.35, 0, 0, Math.PI * 2); x.fill();
    }
  },
  tree: (x: CanvasRenderingContext2D, s: number) => {
    x.fillStyle = '#efe9df'; x.fillRect(0, 0, s, s);
    x.fillStyle = '#4a4744';
    x.fillRect(s * 0.47, s * 0.45, s * 0.06, s * 0.4);
    for (let i = 0; i < 26; i++) { const a = rand() * Math.PI * 2, r = rand() * s * 0.26; x.beginPath(); x.ellipse(s / 2 + Math.cos(a) * r, s * 0.38 + Math.sin(a) * r * 0.75, s * 0.035, s * 0.06, a, 0, Math.PI * 2); x.fill(); }
  },
});

const cache = new Map<string, THREE.Material>();
type Opt = { repeat?: [number, number]; color?: string; roughness?: number; metalness?: number; bump?: number };

export function mat(kind: string, o: Opt = {}): THREE.Material {
  const key = kind + JSON.stringify(o);
  if (cache.has(key)) return cache.get(key)!;
  let m: THREE.Material;
  const painter = painters[kind];
  if (painter) {
    const c = canvas(512, painter);
    const map = tex(c, o.repeat ?? [1, 1]);
    const bumpMap = tex(c, o.repeat ?? [1, 1], false);
    m = new THREE.MeshStandardMaterial({ map, bumpMap, bumpScale: o.bump ?? 0.6, roughness: o.roughness ?? 0.9, metalness: o.metalness ?? 0, color: o.color ?? '#ffffff' });
  } else if (kind === 'glass') {
    m = new THREE.MeshPhysicalMaterial({ color: '#8fa6b6', roughness: 0.06, metalness: 0.5, transparent: true, opacity: 0.55, envMapIntensity: 1.6, clearcoat: 1 });
  } else if (kind === 'metal') {
    m = new THREE.MeshStandardMaterial({ color: o.color ?? '#3a3f47', roughness: o.roughness ?? 0.4, metalness: 0.8 });
  } else if (kind === 'gold') {
    m = new THREE.MeshStandardMaterial({ color: '#b8964f', roughness: 0.28, metalness: 1 });
  } else {
    m = new THREE.MeshStandardMaterial({ color: o.color ?? '#cccccc', roughness: o.roughness ?? 0.8, metalness: o.metalness ?? 0 });
  }
  cache.set(key, m);
  return m;
}

// Windows that light up at dusk share one material, so a single switch lights a city.
export const windowGlow = new THREE.MeshStandardMaterial({ color: '#7d93a6', roughness: 0.08, metalness: 0.65, envMapIntensity: 1.4, emissive: '#ffcf86', emissiveIntensity: 0 });
export const lampGlow = new THREE.MeshStandardMaterial({ color: '#f3ead6', emissive: '#ffd08a', emissiveIntensity: 0 });
