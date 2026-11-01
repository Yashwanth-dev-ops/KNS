'use client';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import { B, Cyl, Wall, Car, Hedge, Static } from './kit';
import { House } from './House';
import { mat, windowGlow, lampGlow } from '../../lib/materials';
import { useWorld, quote, lakh, FINISHES } from '../../lib/store';
import { projects } from '../../lib/content';

const LOGO = '../brand/kns-logo.png';
const LAYOUT = '../brand/villa-layout.jpg';
const navy = () => mat('plain', { color: '#14192b', roughness: 0.6 });

function LogoPanel({ w, p, r, back = true }: { w: number; p: [number, number, number]; r?: [number, number, number]; back?: boolean }) {
  const tex = useTexture(LOGO);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const h = (w * 360) / 530;
  return (
    <group position={p} rotation={r}>
      <B s={[w + 0.8, h + 0.6, 0.2]} p={[0, 0, 0]} m={navy()} />
      <B s={[w + 0.9, 0.06, 0.24]} p={[0, h / 2 + 0.3, 0]} m={mat('gold')} />
      <B s={[w + 0.9, 0.06, 0.24]} p={[0, -h / 2 - 0.3, 0]} m={mat('gold')} />
      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} transparent roughness={0.35} metalness={0.4} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.08} />
      </mesh>
      {back && (
        <mesh position={[0, 0, -0.105]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial map={tex} transparent roughness={0.35} metalness={0.4} />
        </mesh>
      )}
    </group>
  );
}

function PhotoBoard({ src, w, aspect, p }: { src: string; w: number; aspect: number; p: [number, number, number] }) {
  const tex = useTexture(src); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const h = w / aspect;
  return (
    <group position={p}>
      <B s={[w + 0.4, h + 0.4, 0.15]} p={[0, 0, -0.05]} m={navy()} />
      <B s={[w + 0.5, 0.06, 0.2]} p={[0, -h / 2 - 0.2, 0]} m={mat('gold')} />
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.5} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

/* ---------- the entry gate, with the KNS sign on the arch ---------- */
export function Gate() {
  const phase = useWorld((s) => s.phase);
  const left = useRef<THREE.Group>(null), right = useRef<THREE.Group>(null);
  const open = useRef(0);
  useFrame((_, dt) => {
    const target = phase === 'entering' || phase === 'explore' ? 1 : 0;
    open.current += (target - open.current) * Math.min(1, dt * 1.4);
    if (left.current) left.current.rotation.y = open.current * 1.75;
    if (right.current) right.current.rotation.y = -open.current * 1.75;
  });
  const stone = mat('brick', { repeat: [1, 3], bump: 1.4, roughness: 0.9 });
  const bars = mat('metal', { color: '#1b2030', roughness: 0.35 });
  const leaf = (dir: 1 | -1) => (
    <group>
      {Array.from({ length: 11 }).map((_, i) => (
        <B key={i} s={[0.06, 2.6, 0.06]} p={[dir * (0.3 + i * 0.52), 1.4, 0]} m={bars} />
      ))}
      <B s={[5.6, 0.1, 0.1]} p={[dir * 2.9, 0.25, 0]} m={bars} />
      <B s={[5.6, 0.12, 0.12]} p={[dir * 2.9, 2.7, 0]} m={mat('gold')} />
      <B s={[5.6, 0.08, 0.08]} p={[dir * 2.9, 1.5, 0]} m={mat('gold')} />
    </group>
  );
  return (
    <group position={[0, 0, 62]}>
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <B s={[2.2, 8.2, 2.2]} p={[sx * 7.1, 4.1, 0]} m={stone} />
          <B s={[2.6, 0.35, 2.6]} p={[sx * 7.1, 8.35, 0]} m={mat('gold')} />
          <B s={[1.2, 0.5, 1.2]} p={[sx * 7.1, 8.75, 0]} m={mat('concrete')} />
          <mesh position={[sx * 7.1, 9.25, 0]} material={lampGlow}><sphereGeometry args={[0.35, 20, 14]} /></mesh>
        </group>
      ))}
      <B s={[16.4, 1.0, 1.2]} p={[0, 7.6, 0]} m={mat('concrete')} />
      <LogoPanel w={6.4} p={[0, 10.9, 0]} />
      <group ref={left} position={[-6, 0, 0]} userData={{ noMerge: true }}>{leaf(1)}</group>
      <group ref={right} position={[6, 0, 0]} userData={{ noMerge: true }}>{leaf(-1)}</group>
      {/* security cabin */}
      <group position={[12, 0, -3]}>
        <B s={[3.2, 2.8, 3.2]} p={[0, 1.4, 0]} m={mat('plaster', { color: '#efe9de' })} />
        <B s={[3.8, 0.2, 3.8]} p={[0, 2.9, 0]} m={navy()} />
        <B s={[1.6, 1.0, 0.05]} p={[-0.3, 1.6, 1.61]} m={windowGlow} cast={false} />
      </group>
    </group>
  );
}

/* ---------- 1. open plots, with the villa community board ---------- */
export function Plots() {
  const layout = useTexture(LAYOUT); layout.colorSpace = THREE.SRGBColorSpace; layout.anisotropy = 8;
  const soil = mat('soil', { repeat: [6, 5] });
  const post = mat('plain', { color: '#f1eee6' });
  const plots: [number, number][] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) plots.push([-9 + i * 9.2, -6 + j * 23]);
  return (
    <group position={[-36, 0, 24]}>
      <B s={[30, 0.04, 26]} p={[0, 0.02, 0]} m={soil} cast={false} />
      {/* six plots of 30 ft by 75 ft, each marked with corner stones and a line */}
      {[-9.15, 0, 9.15].map((x) =>
        [-1, 1].map((sz) => (
          <group key={`${x}${sz}`} position={[x, 0, sz * 5.9]}>
            {[[-4.5, -5.6], [4.5, -5.6], [-4.5, 5.6], [4.5, 5.6]].map(([a, b], i) => (
              <B key={i} s={[0.22, 0.6, 0.22]} p={[a, 0.3, b]} m={post} />
            ))}
            <B s={[9.0, 0.02, 0.03]} p={[0, 0.5, -5.6]} m={mat('plain', { color: '#d9b25a' })} cast={false} />
            <B s={[9.0, 0.02, 0.03]} p={[0, 0.5, 5.6]} m={mat('plain', { color: '#d9b25a' })} cast={false} />
            <B s={[0.03, 0.02, 11.2]} p={[-4.5, 0.5, 0]} m={mat('plain', { color: '#d9b25a' })} cast={false} />
          </group>
        )),
      )}
      {/* the villa community board, showing KNS's own layout drawing */}
      <group position={[13, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Cyl r={0.12} h={5.2} p={[-3.6, 2.6, 0]} m={mat('metal')} />
        <Cyl r={0.12} h={5.2} p={[3.6, 2.6, 0]} m={mat('metal')} />
        <B s={[8, 5.4, 0.15]} p={[0, 4.9, -0.05]} m={navy()} />
        <mesh position={[0, 4.9, 0.04]}>
          <planeGeometry args={[7.4, 5.24]} />
          <meshStandardMaterial map={layout} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// A part of the build that rises out of the ground when its stage arrives and sinks away when it passes.
function Rise({ on, children }: { on: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const k = useRef(on ? 1 : 0);
  useFrame((_, dt) => {
    if (!g.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    k.current = reduce ? (on ? 1 : 0) : THREE.MathUtils.damp(k.current, on ? 1 : 0, 4.5, dt);
    g.current.scale.y = Math.max(0.0001, k.current);
    g.current.visible = k.current > 0.01;
  });
  return <group ref={g} userData={{ noMerge: true }}>{children}</group>;
}

// The visitor's own house: sized from the plot, floors and package they chose, raised stage by stage.
const FACING_ROT = { east: 0, north: Math.PI / 2, west: Math.PI, south: -Math.PI / 2 } as const;
function DesignedBuild() {
  const stage = useWorld((st) => st.build);
  const d = useWorld((st) => st.design);
  const zone = useWorld((st) => st.zone);
  const q = quote(d);
  const A = q.perFloor * 0.0929, W = Math.min(13.5, Math.sqrt(A / 1.4)), D = Math.min(19, W * 1.4);
  const hw = W / 2, hd = D / 2, P = 0.45, F = 3.1;
  const conc = mat('concrete', { repeat: [2, 2] });
  const xs: number[] = [], zs: number[] = [];
  for (let i = 0, n = Math.max(2, Math.round(W / 4.3)); i <= n; i++) xs.push(-hw + 0.15 + ((W - 0.3) * i) / n);
  for (let i = 0, n = Math.max(3, Math.round(D / 4.3)); i <= n; i++) zs.push(-hd + 0.15 + ((D - 0.3) * i) / n);
  const top = P + d.floors * F;
  return (
    <group rotation={[0, FACING_ROT[d.facing], 0]}>
      <Rise on={stage >= 1 && stage < 3}>
        {xs.flatMap((x) => zs.map((z) => <B key={`f${x}${z}`} s={[1.4, 0.4, 1.4]} p={[x, 0.2, z]} m={conc} />))}
        <B s={[W + 0.4, P, D + 0.4]} p={[0, P / 2, 0]} m={conc} />
      </Rise>
      <Rise on={stage === 2}>
        {Array.from({ length: d.floors }).map((_, lv) => (
          <group key={lv}>
            {xs.flatMap((x) => zs.map((z) => <B key={`c${lv}${x}${z}`} s={[0.3, F - 0.18, 0.3]} p={[x, P + lv * F + (F - 0.18) / 2, z]} m={conc} />))}
            <B s={[W + 0.9, 0.18, D + 0.9]} p={[0, P + (lv + 1) * F - 0.09, 0]} m={conc} />
          </group>
        ))}
      </Rise>
      <Rise on={stage === 3}><House W={W} D={D} floors={d.floors} premium={d.pkg === 'premium'} shell grounds={false} /></Rise>
      <Rise on={stage >= 4}><House W={W} D={D} floors={d.floors} premium={d.pkg === 'premium'} grounds={false} paint={FINISHES.paint[d.paint].color} /></Rise>
      {zone === 'build' && (
        <Html position={[0, top + 3.4, 0]} center zIndexRange={[15, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-gold-500 px-4 py-2 text-center font-semibold text-navy-950 shadow-xl shadow-navy-950/30">
            <span className="block font-display text-2xl leading-none tabular-nums">₹{lakh(q.lo)} to {lakh(q.hi)} lakh</span>
            <span className="mt-0.5 block text-xs tabular-nums">{q.sft.toLocaleString('en-IN')} sft, {d.floors === 2 ? 'G+1' : 'G+2'}, {d.pkg}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------- 2. turnkey construction: a frame going up, and a crane like the one in the logo ---------- */
export function Construction() {
  const jib = useRef<THREE.Group>(null);
  const stage = useWorld((st) => st.build);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame((st) => { if (jib.current && !still && useWorld.getState().quality !== 'minimal') jib.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.12) * 1.1 + 0.6; });
  const conc = mat('concrete', { repeat: [2, 2] });
  const brick = mat('brick', { repeat: [3, 2], bump: 1.2 });
  const steel = mat('metal', { color: '#6f5a40', roughness: 0.6 });
  const craneM = mat('plain', { color: '#c9a043', roughness: 0.45, metalness: 0.5 });
  const scaff = mat('metal', { color: '#9aa1a8', roughness: 0.4 });
  const cols: [number, number][] = [];
  for (const x of [-4.4, 0, 4.4]) for (const z of [-6.4, -2.1, 2.1, 6.4]) cols.push([x, z]);
  const mast = useMemo(() => {
    const parts: React.ReactElement[] = []; const H = 24, s = 1.6;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b], i) => parts.push(<B key={`c${i}`} s={[0.14, H, 0.14]} p={[a * s / 2, H / 2, b * s / 2]} m={craneM} />));
    for (let y = 1.2; y < H; y += 1.6) {
      parts.push(<B key={`h${y}a`} s={[s, 0.08, 0.08]} p={[0, y, s / 2]} m={craneM} />, <B key={`h${y}b`} s={[s, 0.08, 0.08]} p={[0, y, -s / 2]} m={craneM} />);
      parts.push(<B key={`h${y}c`} s={[0.08, 0.08, s]} p={[s / 2, y, 0]} m={craneM} />, <B key={`h${y}d`} s={[0.08, 0.08, s]} p={[-s / 2, y, 0]} m={craneM} />);
      parts.push(<B key={`d${y}`} s={[0.06, 2.2, 0.06]} p={[0, y + 0.8, s / 2]} r={[0, 0, 0.78]} m={craneM} />);
    }
    return parts;
  }, [craneM]);
  return (
    <group position={[30, 0, 10]} rotation={[0, -Math.PI / 2, 0]}>
      <B s={[26, 0.04, 26]} p={[0, 0.02, 0]} m={mat('soil', { repeat: [5, 5] })} cast={false} />
      {/* hoarding in KNS navy with a gold rule */}
      {[[0, 12.8, 26, 0], [0, -12.8, 26, 0], [-12.8, 0, 0, 26]].map(([x, z, w, d], i) => (
        <group key={i}>
          <B s={[w || 0.12, 2.4, d || 0.12]} p={[x, 1.2, z]} m={navy()} />
          <B s={[(w || 0.14), 0.12, (d || 0.14)]} p={[x, 2.2, z]} m={mat('gold')} />
        </group>
      ))}
      <LogoPanel w={3.2} p={[-5.5, 3.6, 12.9]} back={false} />
      <PhotoBoard src="../photos/flyer-villa-dusk.jpg" w={6.4} aspect={499 / 263} p={[3.6, 4.4, 13.0]} />
      <DesignedBuild />
      <Rise on={stage < 4}>
      {/* materials on site: bricks, cement, sand, steel */}
      {[0, 1, 2].map((i) => <B key={`br${i}`} s={[1.2, 0.8, 1.0]} p={[8.5, 0.4 + 0 * i, -8 + i * 1.4]} m={brick} />)}
      {[0, 1, 2, 3].map((i) => <B key={`cb${i}`} s={[0.7, 0.18, 0.45]} p={[8.5 + (i % 2) * 0.75, 0.1 + Math.floor(i / 2) * 0.19, -3.4]} m={mat('plain', { color: '#e8e4da' })} />)}
      <mesh position={[-9, 0.7, -8]} castShadow receiveShadow material={mat('soil', { color: '#d6c2a0' })}><coneGeometry args={[2, 1.4, 18]} /></mesh>
      {Array.from({ length: 9 }).map((_, i) => <Cyl key={`rb${i}`} r={0.025} h={6} p={[-9 + (i % 3) * 0.08, 0.1 + Math.floor(i / 3) * 0.06, -3]} rot={[Math.PI / 2, 0, 0]} m={steel} seg={6} />)}
      </Rise>
      {/* tower crane */}
      <group position={[-8, 0, 8]}>
        <B s={[3, 0.8, 3]} p={[0, 0.4, 0]} m={conc} />
        {mast}
        <group ref={jib} position={[0, 24, 0]} userData={{ noMerge: true }}>
          <B s={[2.2, 2.0, 2.0]} p={[0, 1.0, 1.4]} m={navy()} />
          <B s={[1.7, 1.0, 0.05]} p={[0, 1.2, 2.42]} m={windowGlow} cast={false} />
          <B s={[1.2, 1.2, 22]} p={[0, 2.6, -8]} m={craneM} />
          <B s={[1.2, 1.2, 8]} p={[0, 2.6, 6]} m={craneM} />
          <B s={[2, 1.6, 2.2]} p={[0, 1.6, 9]} m={conc} />
          <B s={[0.2, 4.5, 0.2]} p={[0, 5.2, 0]} m={craneM} />
          <B s={[0.5, 0.4, 0.8]} p={[0, 1.8, -13]} m={steel} />
          <B s={[0.03, 15, 0.03]} p={[0, -5.6, -13]} m={steel} />
          <B s={[1.2, 0.7, 1.0]} p={[0, -13.4, -13]} m={brick} />
        </group>
      </group>
    </group>
  );
}

/* ---------- 3. finishing showroom: a cut-open home ---------- */
export function Showroom() {
  const d = useWorld((st) => st.design);
  const tiles = mat('tiles', { repeat: [6, 5], roughness: 0.22, bump: 0.2, color: FINISHES.tile[d.tile].color });
  const granite = d.granite === 0 ? mat('granite', { repeat: [3, 1], roughness: 0.15 }) : mat('plain', { color: FINISHES.granite[d.granite].color, roughness: 0.12, metalness: 0.15 });
  const wall = mat('plaster', { repeat: [3, 2], color: FINISHES.paint[d.paint].color, bump: 0.1 });
  const feature = mat('plain', { color: '#2f3a4f', roughness: 0.9 });
  const wood = mat('teak', { repeat: [2, 1], roughness: 0.5 });
  const door = d.door === 2 ? mat('plain', { color: FINISHES.door[2].color, roughness: 0.3 }) : mat('teak', { repeat: [1, 2], roughness: 0.4, color: d.door === 1 ? '#8a6a55' : '#ffffff' });
  return (
    <group position={[-30, 0, -2]} rotation={[0, Math.PI / 2, 0]}>
      <B s={[12, 0.4, 9]} p={[0, 0.2, 0]} m={mat('concrete')} />
      <B s={[11.8, 0.04, 8.8]} p={[0, 0.42, 0]} m={tiles} cast={false} />
      {/* two walls only, so the room reads like a section drawing */}
      <B s={[12, 3.2, 0.2]} p={[0, 2.0, -4.4]} m={wall} />
      <B s={[0.2, 3.2, 9]} p={[-5.9, 2.0, 0]} m={feature} />
      {/* false ceiling strip with downlights */}
      <B s={[12, 0.12, 2.4]} p={[0, 3.55, -3.2]} m={mat('plaster', { color: '#f7f3ea' })} />
      {[-4, -1.5, 1, 3.5].map((x) => <mesh key={x} position={[x, 3.48, -3]} material={lampGlow}><cylinderGeometry args={[0.12, 0.12, 0.03, 16]} /></mesh>)}
      {/* kitchen: base cabinets, granite platform, sink, dado tiles, wall cabinets */}
      <B s={[5, 0.86, 0.6]} p={[2.8, 0.85, -4.0]} m={wood} />
      <B s={[5.2, 0.04, 0.66]} p={[2.8, 1.3, -3.98]} m={granite} />
      <B s={[0.6, 0.02, 0.4]} p={[3.4, 1.33, -3.98]} m={mat('metal', { color: '#c9ccd0', roughness: 0.2 })} />
      <B s={[5, 0.6, 0.02]} p={[2.8, 1.62, -4.28]} m={mat('tiles', { repeat: [8, 1], roughness: 0.2 })} />
      <B s={[5, 0.7, 0.35]} p={[2.8, 2.6, -4.12]} m={wood} />
      {/* living: sofa and rug against the feature wall */}
      <B s={[0.9, 0.45, 2.8]} p={[-5.2, 0.65, 0.5]} m={mat('plain', { color: '#b9a98f', roughness: 0.95 })} />
      <B s={[0.25, 0.5, 2.8]} p={[-5.55, 1.1, 0.5]} m={mat('plain', { color: '#b9a98f', roughness: 0.95 })} />
      <B s={[2.6, 0.02, 3.2]} p={[-3.6, 0.44, 0.5]} m={mat('plain', { color: '#8a6f55', roughness: 1 })} cast={false} />
      {/* granite stair sample */}
      {[0, 1, 2, 3, 4].map((i) => <B key={i} s={[1.1, 0.17, 0.3]} p={[5.3, 0.5 + i * 0.17, 1.8 - i * 0.3]} m={granite} />)}
      {/* main door in its frame, and a UPVC window */}
      <B s={[1.3, 2.4, 0.08]} p={[-3.3, 1.62, -4.3]} m={mat('plain', { color: '#3b2a1e' })} />
      <B s={[1.1, 2.2, 0.06]} p={[-3.3, 1.52, -4.25]} m={door} />
      <B s={[0.05, 0.05, 0.12]} p={[-2.85, 1.5, -4.18]} m={mat('gold')} />
      <B s={[2.0, 1.3, 0.04]} p={[0, 2.0, -4.28]} m={windowGlow} cast={false} />
      <B s={[2.1, 0.07, 0.1]} p={[0, 2.68, -4.27]} m={mat('plain', { color: '#f2f0ea' })} />
      <B s={[2.1, 0.07, 0.1]} p={[0, 1.33, -4.27]} m={mat('plain', { color: '#f2f0ea' })} />
    </group>
  );
}

/* ---------- 4. the ready-to-move duplex ---------- */
export function Duplex() {
  return (
    <group position={[30, 0, -32]} rotation={[0, -Math.PI / 2, 0]}>
      <B s={[22, 0.04, 28]} p={[-1.5, 0.02, 0]} m={mat('grass', { repeat: [5, 6], color: '#c8d6b0' })} cast={false} />
      <House />
    </group>
  );
}

/* ---------- 5. apartments: stilt parking and five floors, two flats a floor ---------- */
export function Apartments() {
  const plaster = mat('plaster', { repeat: [4, 6], color: '#ece6da', bump: 0.15 });
  const conc = mat('concrete', { repeat: [3, 3] });
  const dark = mat('glass');
  const W = 18, D = 14, F = 3.1, floors = 5;
  const lit = useMemo(() => Array.from({ length: floors * 8 }).map((_, i) => ((i * 7919) % 10) > 3), []);
  return (
    <group position={[-30, 0, -40]} rotation={[0, Math.PI / 2, 0]}>
      <B s={[26, 0.04, 22]} p={[0, 0.02, 0]} m={mat('paving', { repeat: [8, 7] })} cast={false} />
      {/* stilt level */}
      {[-8.6, -4.3, 0, 4.3, 8.6].flatMap((x) => [-6.6, 0, 6.6].map((z) => <B key={`${x}${z}`} s={[0.45, 3, 0.45]} p={[x, 1.5, z]} m={conc} />))}
      <B s={[4, 3, 4]} p={[0, 1.5, -4]} m={plaster} />
      <Car p={[-6.4, 0, 2.6]} color={1} /><Car p={[-3.2, 0, 3]} color={3} /><Car p={[6.4, 0, 2.6]} color={2} />
      <Hedge p={[0, 0, 10.6]} len={24} /><Hedge p={[-12.6, 0, 0]} len={20} r={Math.PI / 2} />
      {Array.from({ length: floors }).map((_, f) => {
        const y = 3 + f * F;
        return (
          <group key={f}>
            <B s={[W + 0.6, 0.2, D + 0.6]} p={[0, y, 0]} m={conc} />
            {/* front with two flats, each a glass door to its balcony and windows */}
            <group position={[-W / 2, 0, D / 2 - 0.12]}>
              <Wall len={W} h={F - 0.2} y0={y + 0.1} m={plaster} glass={lit[f * 8] ? windowGlow : dark}
                holes={[{ a: 1.2, b: 3.4, sill: 0.9, head: 2.3, kind: 'window' }, { a: 4.4, b: 7.6, sill: 0, head: 2.4, kind: 'glassdoor' }, { a: 10.4, b: 13.6, sill: 0, head: 2.4, kind: 'glassdoor' }, { a: 14.6, b: 16.8, sill: 0.9, head: 2.3, kind: 'window' }]} />
            </group>
            <group position={[-W / 2, 0, -D / 2 + 0.12]}>
              <Wall len={W} h={F - 0.2} y0={y + 0.1} m={plaster} glass={lit[f * 8 + 1] ? windowGlow : dark}
                holes={[{ a: 1.5, b: 3.5, sill: 0.9, head: 2.2, kind: 'window' }, { a: 5.5, b: 7.5, sill: 0.9, head: 2.2, kind: 'window' }, { a: 10.5, b: 12.5, sill: 0.9, head: 2.2, kind: 'window' }, { a: 14.5, b: 16.5, sill: 0.9, head: 2.2, kind: 'window' }]} />
            </group>
            {[-1, 1].map((sx) => (
              <group key={sx} position={[sx * (W / 2 - 0.12), 0, sx > 0 ? D / 2 : -D / 2]} rotation={[0, sx > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
                <Wall len={D} h={F - 0.2} y0={y + 0.1} m={plaster} glass={lit[f * 8 + 2 + (sx > 0 ? 1 : 0)] ? windowGlow : dark}
                  holes={[{ a: 2, b: 4, sill: 0.9, head: 2.2, kind: 'window' }, { a: 9, b: 11, sill: 0.9, head: 2.2, kind: 'window' }]} />
              </group>
            ))}
            {/* balconies with glass and a gold rail */}
            {[-3, 3].map((bx) => (
              <group key={bx}>
                <B s={[4.4, 0.16, 1.6]} p={[bx, y + 0.02, D / 2 + 0.8]} m={conc} />
                <B s={[4.4, 1.0, 0.04]} p={[bx, y + 0.6, D / 2 + 1.58]} m={mat('glass')} cast={false} />
                <B s={[4.5, 0.05, 0.07]} p={[bx, y + 1.12, D / 2 + 1.58]} m={mat('gold')} />
              </group>
            ))}
          </group>
        );
      })}
      <B s={[W + 0.6, 0.2, D + 0.6]} p={[0, 3 + floors * F, 0]} m={conc} />
      <B s={[W + 0.6, 1.1, 0.2]} p={[0, 3.65 + floors * F, D / 2 + 0.2]} m={plaster} />
      <B s={[W + 0.6, 1.1, 0.2]} p={[0, 3.65 + floors * F, -D / 2 - 0.2]} m={plaster} />
      <B s={[5, 3, 5]} p={[0, 4.6 + floors * F, -3]} m={plaster} />
      <B s={[2, 0.7, 4.6]} p={[W / 2 - 0.7, 3.4 + floors * F, 0]} m={navy()} />
    </group>
  );
}

/* ---------- 6. the KNS office, at the end of the drive ---------- */
export function Office() {
  const plaster = mat('plaster', { repeat: [4, 2], color: '#efe9de', bump: 0.12 });
  return (
    <group position={[0, 0, -64]}>
      <B s={[30, 0.05, 18]} p={[0, 0.02, 4]} m={mat('paving', { repeat: [10, 6] })} cast={false} />
      <B s={[16, 0.5, 10]} p={[0, 0.25, 0]} m={mat('concrete')} />
      {/* glass ground floor between navy piers */}
      <B s={[15, 3.4, 0.08]} p={[0, 2.2, 4.6]} m={windowGlow} cast={false} />
      {[-7.6, -2.6, 2.6, 7.6].map((x) => <B key={x} s={[0.6, 3.6, 0.6]} p={[x, 2.3, 4.7]} m={navy()} />)}
      <B s={[16, 3.6, 9.4]} p={[0, 2.3, -0.4]} m={plaster} />
      {/* upper floor and the big sign */}
      <B s={[16.6, 0.3, 10.6]} p={[0, 4.25, 0]} m={mat('concrete')} />
      <B s={[16, 3.4, 10]} p={[0, 6.1, 0]} m={plaster} />
      <B s={[14, 1.4, 0.05]} p={[0, 6.0, 5.03]} m={windowGlow} cast={false} />
      <B s={[16.8, 0.4, 10.8]} p={[0, 8.0, 0]} m={navy()} />
      <LogoPanel w={5.6} p={[0, 10.6, 3]} back={false} />
      <Car p={[-11, 0, 9]} color={1} /><Car p={[11, 0, 9]} color={0} />
      <Hedge p={[0, 0, 12.6]} len={10} />
      {/* canopy, steps and planters */}
      <B s={[6, 0.15, 2.4]} p={[0, 4.0, 6.2]} m={navy()} />
      <B s={[6.1, 0.06, 0.06]} p={[0, 4.1, 7.4]} m={mat('gold')} />
      {[0, 1, 2].map((i) => <B key={i} s={[6, 0.17, 0.4]} p={[0, 0.085 + i * 0.17, 6.2 - i * 0.4]} m={mat('granite', { repeat: [3, 1], roughness: 0.3 })} />)}
      {[-6, 6].map((x) => (
        <group key={x}>
          <B s={[1.4, 0.7, 1.4]} p={[x, 0.35, 7]} m={mat('concrete')} />
          <mesh position={[x, 1.3, 7]} castShadow material={mat('plain', { color: '#4d7a3b', roughness: 0.9 })}><icosahedronGeometry args={[0.85, 1]} /></mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- welcome: three signposts on the drive ---------- */
export function Signposts() {
  const zone = useWorld((st) => st.zone), setZone = useWorld((st) => st.setZone), phase = useWorld((st) => st.phase), villas = useWorld((st) => st.villas);
  const signs = [
    { label: 'Buy a plot', to: 'plots', y: 4.6, dir: -1 },
    { label: 'Build my house', to: 'build', y: 3.7, dir: 1 },
    { label: 'Buy a ready home', to: 'duplex', y: 2.8, dir: 1 },
  ];
  const show = phase === 'explore' && !zone && !villas;
  return (
    <group position={[0, 0, 52]}>
      <B s={[2.6, 0.3, 2.6]} p={[0, 0.15, 0]} m={mat('granite', { repeat: [1, 1], roughness: 0.3 })} />
      <Cyl r={0.09} h={5.4} p={[0, 2.7, 0]} m={mat('gold')} />
      {signs.map((sg) => (
        <group key={sg.to} position={[sg.dir * 1.1, sg.y, 0]}>
          <B s={[2.3, 0.6, 0.08]} p={[0, 0, 0]} m={navy()} />
          <B s={[2.34, 0.05, 0.1]} p={[0, -0.3, 0]} m={mat('gold')} />
          {show && (
            <Html center zIndexRange={[18, 0]}>
              <button type="button" onClick={() => setZone(sg.to)}
                className="whitespace-nowrap rounded-md border border-gold-400 bg-navy-900/90 px-3 py-1.5 text-sm font-semibold text-gold-300 shadow-lg transition-colors duration-150 hover:bg-gold-500 hover:text-navy-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300">
                {sg.dir < 0 ? '← ' : ''}{sg.label}{sg.dir > 0 ? ' →' : ''}
              </button>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

/* ---------- 1. our projects: a pavilion with a map table ---------- */
function mapTexture() {
  const c = document.createElement('canvas'); c.width = 1400; c.height = 880;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 1400, 880); g.addColorStop(0, '#1a2038'); g.addColorStop(1, '#10152a');
  x.fillStyle = g; x.fillRect(0, 0, 1400, 880);
  x.strokeStyle = 'rgba(255,255,255,0.05)'; x.lineWidth = 1;
  for (let i = 0; i < 1400; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 880); x.stroke(); }
  for (let j = 0; j < 880; j += 40) { x.beginPath(); x.moveTo(0, j); x.lineTo(1400, j); x.stroke(); }
  const P = (u: number, v: number) => [(u + 0.5) * 1400, (v + 0.5) * 880];
  // Outer Ring Road around the city, drawn as a loop
  const [cx, cy] = P(0.3, 0.16);
  x.strokeStyle = 'rgba(201,173,108,0.55)'; x.lineWidth = 6; x.setLineDash([]);
  x.beginPath(); x.ellipse(cx, cy, 330, 300, 0, 0, Math.PI * 2); x.stroke();
  x.font = '500 26px Inter, system-ui, sans-serif'; x.fillStyle = 'rgba(227,207,154,0.8)';
  x.fillText('Outer Ring Road', cx + 150, cy - 300);
  x.font = '600 44px "Cormorant Garamond", Georgia, serif'; x.fillStyle = '#f7f5f0';
  x.fillText('Hyderabad', cx + 20, cy + 70);
  x.font = '500 30px Inter, system-ui, sans-serif'; x.fillStyle = 'rgba(247,245,240,0.85)';
  const lbl = (t: string, u: number, v: number, dx = 26, dy = -18) => { const [a, b] = P(u, v); x.fillText(t, a + dx, b + dy); };
  lbl('Kondapur', 0.07, 0.02, 30, -26); lbl('Patancheru', -0.33, -0.26, 30, -26);
  x.font = '500 24px Inter, system-ui, sans-serif'; x.fillStyle = 'rgba(247,245,240,0.6)';
  x.fillText('Not to scale', 1180, 850);
  // north arrow
  x.fillStyle = '#c9ad6c'; x.beginPath(); x.moveTo(1320, 60); x.lineTo(1300, 110); x.lineTo(1340, 110); x.closePath(); x.fill();
  x.font = '600 30px Inter, system-ui, sans-serif'; x.fillText('N', 1310, 145);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function ProjectsPavilion() {
  const tex = useMemo(() => mapTexture(), []);
  const project = useWorld((st) => st.project), setProject = useWorld((st) => st.setProject), zone = useWorld((st) => st.zone);
  const TW = 7, TD = 4.4, TH = 1.0;
  return (
    <group position={[-17, 0, 44]} rotation={[0, Math.PI / 2, 0]}>
      <B s={[13, 0.3, 10]} p={[0, 0.15, 0]} m={mat('paving', { repeat: [5, 4] })} />
      {[[-5.8, -4.3], [5.8, -4.3], [-5.8, 4.3], [5.8, 4.3]].map(([x, z], i) => <B key={i} s={[0.45, 4.3, 0.45]} p={[x, 2.45, z]} m={navy()} />)}
      {/* an open pergola, so the map table stays visible from above */}
      {[-4.3, 4.3].map((z) => <B key={z} s={[13.4, 0.4, 0.3]} p={[0, 4.75, z]} m={navy()} />)}
      {[-5.8, -2.9, 0, 2.9, 5.8].map((x) => <B key={x} s={[0.16, 0.22, 9]} p={[x, 4.85, 0]} m={mat('gold')} />)}
      <B s={[TW + 0.3, TH, TD + 0.3]} p={[0, 0.3 + TH / 2, 0]} m={mat('teak', { repeat: [3, 1], roughness: 0.45 })} />
      <mesh position={[0, 0.3 + TH + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[TW, TD]} />
        <meshStandardMaterial map={tex} roughness={0.55} />
      </mesh>
      {projects.map((p) => {
        const on = project === p.slug;
        const x = p.mapPos[0] * TW, z = p.mapPos[1] * TD, y = 0.3 + TH;
        return (
          <group key={p.slug} position={[x, y, z]} userData={{ noMerge: true }}>
            <mesh position={[0, 0.35, 0]} material={mat('gold')} castShadow><coneGeometry args={[0.09, 0.7, 16]} /></mesh>
            <mesh position={[0, 0.78, 0]} material={on ? lampGlow : mat('gold')} castShadow><sphereGeometry args={[on ? 0.2 : 0.15, 20, 14]} /></mesh>
            {zone === 'projects' && (
              <Html position={[0, 1.2, 0]} center zIndexRange={[19, 0]}>
                <button type="button" onClick={() => setProject(p.slug)} aria-pressed={on}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold shadow-lg transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300 ${on ? 'bg-gold-500 text-navy-950' : 'bg-stone-50 text-navy-900 hover:bg-gold-300'}`}>
                  {p.name.split(',')[0]}
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
