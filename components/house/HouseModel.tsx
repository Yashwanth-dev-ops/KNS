'use client';
// The G+1 from KNS's design render, built to scale (about 9 m by 13 m), front facing +z.
// Facade follows the render; the room layout is indicative until KNS shares the real plan.
// mode: outside (everything), first (roof lifted off), ground (first floor lifted off too).
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { B, Cyl, Wall, Static, Car, type Hole } from '../scene/kit';
import { mat, windowGlow, lampGlow } from '../../lib/materials';

export type HouseMode = 'outside' | 'first' | 'ground';
type V3 = [number, number, number];

const P = 0.45, F = 3.1, G1 = P + F, H = F - 0.15; // plinth top, first floor level, wall height
const cream = () => mat('plaster', { repeat: [3, 2], color: '#f1ebe0', bump: 0.12 });
const slate = () => mat('plain', { color: '#5d6b70', roughness: 0.7 });
const wood = () => mat('teak', { repeat: [1, 3], roughness: 0.5, color: '#9a7457' });
const darkWood = () => mat('teak', { repeat: [1, 3], roughness: 0.35, color: '#6a4a36' });
const marble = (c = '#ffffff') => mat('marble', { repeat: [4, 4], roughness: 0.12, bump: 0.05, color: c });
const fabric = (c: string) => mat('plain', { color: c, roughness: 0.95 });

const win = (a: number, b: number): Hole => ({ a, b, sill: 0.9, head: 2.2, kind: 'window' });
const door = (a: number, b: number, kind: Hole['kind'] = 'door'): Hole => ({ a, b, sill: 0, head: 2.15, kind });

// A wall along x starting at (x0, z), or along z starting at (x, z0).
function WX({ x0, z, len, y0, holes = [], t = 0.23, h = H }: { x0: number; z: number; len: number; y0: number; holes?: Hole[]; t?: number; h?: number }) {
  return <group position={[x0, 0, z]}><Wall len={len} h={h} y0={y0} t={t} m={cream()} holes={holes} /></group>;
}
function WZ({ x, z0, len, y0, holes = [], t = 0.23, h = H }: { x: number; z0: number; len: number; y0: number; holes?: Hole[]; t?: number; h?: number }) {
  return <group position={[x, 0, z0]} rotation={[0, -Math.PI / 2, 0]}><Wall len={len} h={h} y0={y0} t={t} m={cream()} holes={holes} /></group>;
}

// The full-height vertical wood fins on the front right corner, in floor-sized pieces.
function Fins({ y0, y1 }: { y0: number; y1: number }) {
  const h = y1 - y0;
  return (
    <group>
      {Array.from({ length: 9 }).map((_, i) => <B key={i} s={[0.06, h, 0.12]} p={[3.48 + i * 0.105, y0 + h / 2, 6.66]} m={darkWood()} />)}
      <B s={[0.95, h, 0.04]} p={[3.9, y0 + h / 2, 6.58]} m={mat('plain', { color: '#2b2522' })} />
      <B s={[0.12, h, 0.32]} p={[4.5, y0 + h / 2, 6.6]} m={slate()} />
    </group>
  );
}
// Grey sunshade boxes over the side windows.
function Shade({ z, y }: { z: number; y: number }) {
  return (
    <group>
      <B s={[0.45, 0.1, 1.3]} p={[4.74, y, z]} m={slate()} />
      <B s={[0.45, 1.3, 0.08]} p={[4.74, y - 0.65, z + 0.61]} m={slate()} />
    </group>
  );
}
function Downlights({ pts, y }: { pts: [number, number][]; y: number }) {
  return <>{pts.map(([x, z], i) => <mesh key={i} position={[x, y, z]} material={lampGlow}><cylinderGeometry args={[0.07, 0.07, 0.02, 12]} /></mesh>)}</>;
}
function Floor({ x0, x1, z0, z1, y, m }: { x0: number; x1: number; z0: number; z1: number; y: number; m: THREE.Material }) {
  return <B s={[x1 - x0, 0.02, z1 - z0]} p={[(x0 + x1) / 2, y + 0.01, (z0 + z1) / 2]} m={m} cast={false} />;
}
function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl r={0.06} h={1.2} p={[0, 0.6, 0]} m={mat('plain', { color: '#5b4532' })} seg={6} />
      <mesh position={[0, 1.45, 0]} castShadow material={mat('plain', { color: '#4f7a3a', roughness: 0.9 })}><icosahedronGeometry args={[0.5, 1]} /></mesh>
    </group>
  );
}

function Fan({ p }: { p: V3 }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current && !matchMedia('(prefers-reduced-motion: reduce)').matches) g.current.rotation.y += dt * 2.2; });
  const m = mat('plain', { color: '#4a3326', roughness: 0.6 });
  return (
    <group position={p} userData={{ noMerge: true }}>
      <Cyl r={0.025} h={0.3} p={[0, 0.15, 0]} m={m} seg={8} />
      <group ref={g}>
        <Cyl r={0.12} h={0.1} p={[0, 0, 0]} m={m} seg={16} />
        {[0, 1, 2].map((i) => <B key={i} s={[0.6, 0.015, 0.12]} p={[0.38 * Math.cos((i * 2 * Math.PI) / 3), 0, 0.38 * Math.sin((i * 2 * Math.PI) / 3)]} r={[0, -(i * 2 * Math.PI) / 3, 0]} m={m} cast={false} />)}
      </group>
    </group>
  );
}

/* ---------------- ground floor: shell, porch and rooms ---------------- */
function GroundFloor() {
  const y = P;
  return (
    <Static>
      <B s={[9.4, P, 13.4]} p={[0, P / 2, 0]} m={mat('concrete', { repeat: [3, 4] })} />
      {/* outer walls */}
      <WX x0={-1.2} z={6.385} len={5.7} y0={y} holes={[win(1.8, 3.4)]} />
      <WZ x={-1.2} z0={1.0} len={5.5} y0={y} holes={[door(2.0, 3.1)]} />
      <WX x0={-4.5} z={1.0} len={3.3} y0={y} holes={[door(1.0, 2.0)]} />
      <WZ x={-4.385} z0={-6.5} len={7.5} y0={y} holes={[win(1.2, 2.4), win(5.0, 6.2)]} />
      <WZ x={4.385} z0={-6.5} len={13} y0={y} holes={[win(2.0, 3.0), win(4.5, 5.5), win(8.8, 10.0)]} />
      <WX x0={-4.5} z={-6.385} len={9} y0={y} holes={[win(1.6, 2.6), win(6.2, 7.6)]} />
      {[[-4.0], [-1.5], [3.3]].map(([z]) => <Shade key={z} z={z} y={y + 2.4} />)}
      {/* inner walls */}
      <WX x0={-4.5} z={-2.0} len={4.0} y0={y} t={0.12} holes={[door(3.0, 3.8, 'open')]} />
      <WZ x={-0.5} z0={-6.5} len={4.5} y0={y} t={0.12} />
      <WZ x={-0.5} z0={-2.0} len={2.2} y0={y} t={0.12} holes={[door(0.6, 1.5)]} />
      <WX x0={-0.5} z={0.2} len={3.1} y0={y} t={0.12} />
      <WX x0={2.6} z={-4.2} len={1.9} y0={y} t={0.12} holes={[door(0.3, 1.1)]} />
      <WZ x={2.6} z0={-6.5} len={2.3} y0={y} t={0.12} />
      {/* floors: porch tiles, marble inside */}
      <Floor x0={-4.5} x1={-1.2} z0={1} z1={6.5} y={y} m={mat('tiles', { repeat: [4, 7], color: '#cdbfa8', roughness: 0.6 })} />
      <Floor x0={-4.4} x1={4.4} z0={-6.4} z1={1} y={y} m={marble()} />
      <Floor x0={-1.1} x1={4.4} z0={1} z1={6.4} y={y} m={marble()} />
      <Car p={[-2.85, y, 3.9]} color={1} />
      {/* main door on the porch side wall: dark wood, black granite steps */}
      <B s={[0.3, 0.15, 1.3]} p={[-1.45, y + 0.075, 3.55]} m={mat('granite', { roughness: 0.2 })} />

      {/* living room, after the living render: TV wall, marble panel, wood slats, cove-lit ceiling with a wood panel */}
      <group>
        <B s={[2.5, 0.42, 0.45]} p={[1.0, y + 0.3, 0.5]} m={mat('plain', { color: '#f2efe9', roughness: 0.4 })} />
        <B s={[2.4, 0.3, 0.02]} p={[1.0, y + 0.3, 0.73]} m={darkWood()} cast={false} />
        <B s={[2.3, 1.7, 0.04]} p={[1.0, y + 1.65, 0.3]} m={marble('#ead8c0')} />
        <B s={[2.4, 0.05, 0.25]} p={[1.0, y + 2.55, 0.38]} m={darkWood()} />
        <B s={[2.3, 0.02, 0.02]} p={[1.0, y + 2.52, 0.45]} m={lampGlow} cast={false} />
        <B s={[1.4, 0.8, 0.05]} p={[1.0, y + 1.5, 0.35]} m={mat('plain', { color: '#0f1013', roughness: 0.15, metalness: 0.4 })} />
        {Array.from({ length: 6 }).map((_, i) => <B key={i} s={[0.05, 2.6, 0.08]} p={[-0.42 + i * 0.07, y + 1.3, 0.32]} m={darkWood()} />)}
        <B s={[0.35, 2.2, 0.35]} p={[2.42, y + 1.1, 0.45]} m={darkWood()} />
        {/* sofa, rug, coffee table */}
        <B s={[2.6, 0.42, 0.9]} p={[0.8, y + 0.21, 4.9]} m={fabric('#c9bca8')} />
        <B s={[2.6, 0.5, 0.2]} p={[0.8, y + 0.65, 5.3]} m={fabric('#c9bca8')} />
        <B s={[0.9, 0.42, 1.8]} p={[-0.5, y + 0.21, 4.2]} m={fabric('#c9bca8')} />
        <B s={[1.1, 0.35, 0.6]} p={[0.9, y + 0.18, 3.6]} m={wood()} />
        <B s={[2.8, 0.01, 2.0]} p={[0.8, y + 0.025, 3.8]} m={fabric('#e6ded1')} cast={false} />
        {/* false ceiling: drop band around the edge, cove light, wood slat centre */}
        {([[-1.1, 3.0, 0.6, 6.2, 1.0, 3.3], [2.5, 3.0, 0.6, 6.2, 2.2, 3.3], [0.7, 3.0, 3.0, 0.6, 0.7, 0.55], [0.7, 3.0, 3.0, 0.6, 0.7, 6.05]] as number[][]).map(([, , w, d, x, z], i) => (
          <B key={i} s={[w, 0.22, d]} p={[x, y + 2.84, z]} m={mat('plaster', { color: '#f6f2ea' })} />
        ))}
        <B s={[2.2, 0.03, 4.3]} p={[0.7, y + 2.93, 3.3]} m={wood()} cast={false} />
        <B s={[2.6, 0.02, 0.03]} p={[0.7, y + 2.72, 0.88]} m={lampGlow} cast={false} />
        <B s={[2.6, 0.02, 0.03]} p={[0.7, y + 2.72, 5.72]} m={lampGlow} cast={false} />
        <Downlights y={y + 2.72} pts={[[-0.1, 1.5], [1.5, 1.5], [-0.1, 5.1], [1.5, 5.1]]} />
        {/* staircase: white marble treads with black nosing, glass rail */}
        {Array.from({ length: 17 }).map((_, i) => (
          <group key={i}>
            <B s={[1.6, 0.18 * (i + 1), 0.235]} p={[3.45, y + 0.09 * (i + 1), 4.5 - i * 0.235]} m={marble()} />
            <B s={[1.6, 0.03, 0.03]} p={[3.45, y + 0.18 * (i + 1), 4.5 - i * 0.235 + 0.12]} m={mat('plain', { color: '#151515' })} cast={false} />
          </group>
        ))}
        <B s={[0.03, 1.0, 4.0]} p={[2.62, y + 2.0, 2.5]} r={[0.66, 0, 0]} m={mat('glass')} cast={false} />
      </group>

      {/* kitchen, after the kitchen render: L-shaped, black granite, beige units, grey dado, tall glass-front unit */}
      <group>
        <B s={[3.8, 0.85, 0.6]} p={[-2.55, y + 0.425, -6.08]} m={mat('plain', { color: '#e5d2b0', roughness: 0.35 })} />
        <B s={[0.6, 0.85, 3.4]} p={[-4.08, y + 0.425, -4.1]} m={mat('plain', { color: '#e5d2b0', roughness: 0.35 })} />
        <B s={[3.9, 0.04, 0.66]} p={[-2.55, y + 0.87, -6.06]} m={mat('granite', { roughness: 0.1 })} />
        <B s={[0.66, 0.04, 3.5]} p={[-4.06, y + 0.87, -4.1]} m={mat('granite', { roughness: 0.1 })} />
        <B s={[0.75, 0.02, 0.45]} p={[-3.0, y + 0.9, -6.05]} m={mat('plain', { color: '#0d0d0f', roughness: 0.3 })} />
        <B s={[3.8, 0.65, 0.02]} p={[-2.55, y + 1.22, -6.37]} m={marble('#8f9096')} cast={false} />
        <B s={[0.02, 0.65, 3.4]} p={[-4.37, y + 1.22, -4.1]} m={marble('#8f9096')} cast={false} />
        <B s={[1.5, 0.7, 0.35]} p={[-1.4, y + 2.15, -6.2]} m={mat('plain', { color: '#e5d2b0', roughness: 0.35 })} />
        <B s={[0.35, 0.7, 2.6]} p={[-4.2, y + 2.15, -3.9]} m={mat('plain', { color: '#e5d2b0', roughness: 0.35 })} />
        <B s={[0.6, 2.2, 1.1]} p={[-0.88, y + 1.1, -2.7]} m={mat('plain', { color: '#e5d2b0', roughness: 0.35 })} />
        <B s={[0.02, 1.6, 0.9]} p={[-1.19, y + 1.3, -2.7]} m={mat('glass')} cast={false} />
        <B s={[1.2, 0.04, 0.05]} p={[-2.4, y + 2.4, -6.36]} m={lampGlow} cast={false} />
        <Floor x0={-4.4} x1={-0.6} z0={-6.4} z1={-2.05} y={y + 0.002} m={marble()} />
      </group>
      {/* dining between the porch and the kitchen */}
      <B s={[1.4, 0.05, 0.9]} p={[-2.8, y + 0.75, -0.5]} m={wood()} />
      <B s={[0.08, 0.72, 0.08]} p={[-2.8, y + 0.36, -0.5]} m={darkWood()} />
      {[[-3.3, -1.1], [-2.3, -1.1], [-3.3, 0.1], [-2.3, 0.1]].map(([x, z], i) => <B key={i} s={[0.42, 0.45, 0.42]} p={[x, y + 0.225, z]} m={fabric('#d8cfc0')} />)}
      {/* ground floor bedroom (simple) */}
      <B s={[1.6, 0.45, 2.0]} p={[0.9, y + 0.225, -5.2]} m={fabric('#ece8e1')} />
      <B s={[1.7, 0.9, 0.1]} p={[0.9, y + 0.5, -6.25]} m={darkWood()} />
      <B s={[0.6, 2.2, 1.6]} p={[2.25, y + 1.1, -1.4]} m={mat('plain', { color: '#efece6', roughness: 0.4 })} />

      {/* site: drive, lawn, compound wall, gate, footpath and road */}
      <Floor x0={-4.5} x1={-1.2} z0={6.5} z1={9.8} y={0} m={mat('paving', { repeat: [3, 3] })} />
      <Floor x0={-1.2} x1={5.5} z0={6.9} z1={9.8} y={0} m={mat('grass', { repeat: [5, 3], color: '#b9cfa0' })} />
      <Floor x0={-5.6} x1={5.6} z0={9.9} z1={10.9} y={0} m={mat('paving', { repeat: [8, 1] })} />
      <Floor x0={-12} x1={12} z0={10.9} z1={17} y={-0.01} m={mat('asphalt', { repeat: [8, 2] })} />
      <B s={[24, 0.01, 0.12]} p={[0, 0.01, 11.6]} m={mat('plain', { color: '#e8e4d6' })} cast={false} />
      <B s={[6.7, 1.2, 0.2]} p={[2.15, 0.6, 9.8]} m={cream()} />
      <B s={[0.2, 1.4, 17]} p={[5.6, 0.7, 1.3]} m={cream()} />
      <B s={[0.2, 1.4, 17]} p={[-5.6, 0.7, 1.3]} m={cream()} />
      <B s={[0.25, 1.5, 0.25]} p={[-4.6, 0.75, 9.8]} m={slate()} />
      {/* gate: black frame, white slats, perforated middle panel */}
      <group position={[-2.85, 0, 9.8]}>
        <B s={[3.2, 0.06, 0.06]} p={[0, 1.42, 0]} m={mat('metal', { color: '#16181c' })} />
        <B s={[3.2, 0.06, 0.06]} p={[0, 0.1, 0]} m={mat('metal', { color: '#16181c' })} />
        {[-1.57, 0, 1.57].map((x) => <B key={x} s={[0.06, 1.38, 0.06]} p={[x, 0.76, 0]} m={mat('metal', { color: '#16181c' })} />)}
        {[0.25, 0.42, 0.59, 1.03, 1.2, 1.37].map((yy) => <B key={yy} s={[3.1, 0.08, 0.03]} p={[0, yy, 0]} m={mat('plain', { color: '#e9e6e0' })} />)}
        <B s={[3.1, 0.34, 0.02]} p={[0, 0.81, 0]} m={mat('jaali', { repeat: [8, 1] })} />
      </group>
      <Plant p={[-5.0, 0, 8.6]} s={0.9} /><Plant p={[5.0, 0, 8.8]} s={1.1} /><Plant p={[-0.6, 0, 9.3]} s={0.6} />
      <Fins y0={0} y1={G1} />
    </Static>
  );
}

/* ---------------- first floor: shell, balcony frame and rooms ---------------- */
function FirstFloor() {
  const y = G1;
  return (
    <Static>
      <B s={[9.2, 0.15, 13.2]} p={[0, y - 0.075, 0]} m={mat('concrete', { repeat: [3, 4] })} />
      <B s={[7.1, 0.15, 1.0]} p={[-1.15, y - 0.075, 7.0]} m={mat('concrete')} />
      {/* outer walls: front recessed behind the balcony, flush on the right */}
      <WX x0={-4.5} z={5.6} len={6.7} y0={y} holes={[door(1.9, 3.1, 'glassdoor'), win(4.9, 6.3)]} />
      <WX x0={2.2} z={6.385} len={2.3} y0={y} />
      <WZ x={2.2} z0={5.6} len={0.9} y0={y} />
      <WZ x={-4.385} z0={-6.5} len={12.1} y0={y} holes={[win(2.0, 3.2), win(8.0, 9.2)]} />
      <WZ x={4.385} z0={-6.5} len={13} y0={y} holes={[win(2.0, 3.0), win(4.5, 5.5), win(8.8, 10.0)]} />
      <WX x0={-4.5} z={-6.385} len={9} y0={y} holes={[win(1.6, 2.6), win(6.2, 7.6)]} />
      {[[-4.0], [-1.5], [3.3]].map(([z]) => <Shade key={z} z={z} y={y + 2.4} />)}
      {/* the projecting slate frame around the balcony, with downlights in its soffit */}
      <B s={[0.35, 3.1, 1.1]} p={[-4.575, y + 1.45, 7.05]} m={slate()} />
      <B s={[0.35, 3.1, 1.1]} p={[2.225, y + 1.45, 7.05]} m={slate()} />
      <B s={[7.15, 0.35, 1.1]} p={[-1.175, y + 2.92, 7.05]} m={slate()} />
      <B s={[7.15, 0.3, 1.1]} p={[-1.175, y - 0.2, 7.05]} m={slate()} />
      <B s={[3.95, 1.0, 0.04]} p={[-2.4, y + 0.5, 7.45]} m={mat('glass')} cast={false} />
      <B s={[3.95, 0.04, 0.05]} p={[-2.4, y + 1.02, 7.45]} m={mat('metal', { color: '#b9bec4' })} />
      <B s={[2.4, 1.05, 0.2]} p={[0.85, y + 0.52, 7.4]} m={cream()} />
      <B s={[0.3, 2.75, 0.3]} p={[-0.45, y + 1.37, 6.9]} m={cream()} />
      <B s={[0.7, 1.8, 0.04]} p={[-3.85, y + 1.2, 5.73]} m={mat('jaali', { repeat: [1, 2] })} />
      <Downlights y={y + 2.72} pts={[[-3.8, 7.05], [-2.4, 7.05], [-1.0, 7.05], [0.4, 7.05], [1.6, 7.05]]} />
      <Fins y0={G1} y1={G1 + F} />
      {/* inner walls */}
      <WX x0={0} z={-0.5} len={2.6} y0={y} t={0.12} holes={[door(0.3, 1.2)]} />
      <WZ x={0} z0={-6.5} len={6.0} y0={y} t={0.12} />
      <WX x0={-4.5} z={-0.5} len={4.5} y0={y} t={0.12} holes={[door(3.2, 4.1)]} />
      <Floor x0={-4.4} x1={4.4} z0={-6.4} z1={5.5} y={y} m={marble()} />
      <Floor x0={-4.4} x1={2.1} z0={5.6} z1={7.4} y={y} m={mat('tiles', { repeat: [5, 2], color: '#c9c3b8', roughness: 0.7 })} />

      {/* master bedroom, after the bedroom render: padded headboard on a wood panel, chevron wardrobe with lofts, dresser, curtains, fan */}
      <group>
        <B s={[3.4, 1.25, 0.04]} p={[2.0, y + 0.85, -6.25]} m={darkWood()} />
        <B s={[2.0, 0.6, 0.12]} p={[2.0, y + 0.95, -6.18]} m={fabric('#3d3029')} />
        <B s={[1.9, 0.35, 2.1]} p={[2.0, y + 0.175, -5.1]} m={darkWood()} />
        <B s={[1.85, 0.25, 2.0]} p={[2.0, y + 0.47, -5.1]} m={fabric('#f2f0ec')} />
        <B s={[1.9, 0.03, 0.6]} p={[2.0, y + 0.61, -4.6]} m={fabric('#7a7470')} />
        {[1.45, 2.0, 2.55].map((x, i) => <B key={x} s={[0.5, 0.22, 0.18]} p={[x, y + 0.7, -6.0]} m={fabric(i === 1 ? '#2b2522' : '#f5f3ef')} />)}
        {[0.6, 3.4].map((x) => (
          <group key={x}>
            <B s={[0.5, 0.5, 0.45]} p={[x, y + 0.25, -6.0]} m={darkWood()} />
            <Cyl r={[0.12, 0.15]} h={0.22} p={[x, y + 0.75, -6.0]} m={lampGlow} seg={16} />
          </group>
        ))}
        <B s={[0.03, 0.04, 1.6]} p={[0.08, y + 2.3, -4.8]} m={lampGlow} cast={false} />
        <B s={[0.6, 2.1, 1.8]} p={[4.08, y + 1.05, -2.2]} m={mat('chevron', { repeat: [3, 1], roughness: 0.3 })} />
        <B s={[0.6, 0.75, 4.2]} p={[4.08, y + 2.5, -3.4]} m={mat('teak', { repeat: [4, 1], roughness: 0.2, color: '#5a3a26' })} />
        <B s={[0.03, 1.0, 0.6]} p={[4.36, y + 1.55, -5.6]} m={mat('metal', { color: '#dfe3e6', roughness: 0.05 })} />
        <B s={[0.45, 0.1, 0.75]} p={[4.13, y + 0.75, -5.6]} m={darkWood()} />
        <B s={[0.4, 0.45, 0.4]} p={[3.7, y + 0.225, -5.6]} m={darkWood()} />
        {[-4.65, -3.35].map((z) => <B key={z} s={[0.08, 2.4, 0.4]} p={[4.3, y + 1.3, z]} m={fabric('#e8dcc4')} />)}
        <B s={[2.2, 0.01, 1.6]} p={[2.0, y + 0.02, -3.4]} m={fabric('#efeae2')} cast={false} />
        <Downlights y={y + 2.9} pts={[[1.2, -2.0], [3.2, -2.0], [1.2, -5.0], [3.2, -5.0]]} />
        <Fan p={[2.1, y + 2.6, -3.4]} />
      </group>
      {/* second bedroom and the lounge (simple) */}
      <B s={[1.6, 0.45, 2.0]} p={[-2.2, y + 0.225, -5.2]} m={fabric('#ece8e1')} />
      <B s={[1.7, 0.9, 0.1]} p={[-2.2, y + 0.5, -6.25]} m={wood()} />
      <B s={[2.2, 0.42, 0.85]} p={[-2.0, y + 0.21, 2.0]} m={fabric('#bfb4a2')} />
      <B s={[2.2, 0.5, 0.2]} p={[-2.0, y + 0.62, 1.6]} m={fabric('#bfb4a2')} />
      <Plant p={[1.6, y, 6.9]} s={0.55} />
    </Static>
  );
}

/* ---------------- roof: slab, parapet, stair tower with emblem and cove lights ---------------- */
function Roof() {
  const y = G1 + F;
  return (
    <Static>
      <B s={[9.2, 0.15, 13.2]} p={[0, y - 0.075, 0]} m={mat('concrete', { repeat: [3, 4] })} />
      <B s={[5.6, 1.0, 0.2]} p={[-1.8, y + 0.5, 6.4]} m={cream()} />
      <B s={[0.2, 1.0, 13]} p={[-4.5, y + 0.5, 0]} m={cream()} />
      <B s={[9.2, 1.0, 0.2]} p={[0, y + 0.5, -6.5]} m={cream()} />
      <B s={[0.2, 1.0, 7.5]} p={[4.5, y + 0.5, -2.75]} m={cream()} />
      <B s={[9.4, 0.08, 0.36]} p={[0, y + 1.04, -6.5]} m={slate()} />
      {/* square frame on the parapet, as in the render */}
      <B s={[1.2, 1.2, 0.35]} p={[-3.6, y + 1.5, 6.55]} m={slate()} />
      <B s={[0.75, 0.75, 0.37]} p={[-3.6, y + 1.5, 6.56]} m={mat('plain', { color: '#2a2d33' })} />
      {[-1.25, -1.05].map((x) => <Cyl key={x} r={0.05} h={1.4} p={[x, y + 0.7, 6.45]} m={slate()} seg={8} />)}
      {/* stair tower: cream block, slate cap, tree emblem, cove lights along the front edge */}
      <B s={[3.5, 3.25, 5.5]} p={[2.75, y + 1.625, 3.75]} m={cream()} />
      <B s={[3.7, 0.22, 5.7]} p={[2.75, y + 3.36, 3.75]} m={slate()} />
      <B s={[1.3, 1.3, 0.02]} p={[2.1, y + 2.0, 6.51]} m={mat('tree')} cast={false} />
      <Downlights y={y + 3.24} pts={[[1.4, 6.6], [2.2, 6.6], [3.0, 6.6], [3.8, 6.6]]} />
      <Fins y0={G1 + F} y1={y + 3.47} />
    </Static>
  );
}

export function HouseModel({ mode }: { mode: HouseMode }) {
  return (
    <group>
      <GroundFloor />
      <group visible={mode !== 'ground'}><FirstFloor /></group>
      <group visible={mode === 'outside'}><Roof /></group>
      {/* warm room lights, so the inside reads when you step in */}
      <pointLight position={[0.8, P + 2.6, 3.2]} intensity={7} distance={8} decay={2} color="#ffd9a8" />
      <pointLight position={[-2.5, P + 2.6, -4.3]} intensity={5} distance={6} decay={2} color="#f4f1ff" />
      <pointLight position={[2.1, G1 + 2.5, -3.4]} intensity={visibleFirst(mode) ? 6 : 0} distance={7} decay={2} color="#ffd9a8" />
    </group>
  );
}
const visibleFirst = (m: HouseMode) => m !== 'ground';

export { windowGlow };
