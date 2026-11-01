'use client';
// Building blocks: boxes that cast and take shadows, and walls cut with real openings.
import * as THREE from 'three';
import { ReactNode } from 'react';
import { mat, windowGlow } from '../../lib/materials';

type V3 = [number, number, number];

export function B({ s, p, m, r, cast = true, receive = true }: { s: V3; p: V3; m: THREE.Material; r?: V3; cast?: boolean; receive?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={s} />
    </mesh>
  );
}

export function Cyl({ r, h, p, m, seg = 12, rot }: { r: number | [number, number]; h: number; p: V3; m: THREE.Material; seg?: number; rot?: V3 }) {
  const [a, b] = Array.isArray(r) ? r : [r, r];
  return (
    <mesh position={p} rotation={rot} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[a, b, h, seg]} />
    </mesh>
  );
}

export type Hole = { a: number; b: number; sill: number; head: number; kind?: 'window' | 'door' | 'glassdoor' | 'open' };

// A wall along local x from 0 to len, base at y0, height h, thickness t, centred on z=0; holes cut in.
export function Wall({ len, h, t = 0.23, y0 = 0, holes = [], m, glass }: { len: number; h: number; t?: number; y0?: number; holes?: Hole[]; m: THREE.Material; glass?: THREE.Material }) {
  const pieces: ReactNode[] = [];
  let cx = 0; let k = 0;
  const box = (x0: number, x1: number, ya: number, yb: number) => {
    if (x1 - x0 < 0.01 || yb - ya < 0.01) return;
    pieces.push(<B key={k++} s={[x1 - x0, yb - ya, t]} p={[(x0 + x1) / 2, y0 + (ya + yb) / 2, 0]} m={m} />);
  };
  const sorted = [...holes].sort((p, q) => p.a - q.a);
  for (const hl of sorted) {
    box(cx, hl.a, 0, h);
    box(hl.a, hl.b, 0, hl.sill);
    box(hl.a, hl.b, hl.head, h);
    const w = hl.b - hl.a, hh = hl.head - hl.sill, mid = (hl.a + hl.b) / 2, my = y0 + (hl.sill + hl.head) / 2;
    if (hl.kind !== 'open') {
      const g = hl.kind === 'door' ? mat('teak', { repeat: [1, 2], roughness: 0.55 }) : glass ?? windowGlow;
      pieces.push(<B key={k++} s={[w, hh, 0.05]} p={[mid, my, hl.kind === 'door' ? 0 : -0.04]} m={g} cast={false} />);
      // a slim frame
      const f = mat('metal', { color: hl.kind === 'door' ? '#3b2a1e' : '#e9e6df', roughness: 0.5 });
      pieces.push(<B key={k++} s={[w + 0.08, 0.06, t + 0.04]} p={[mid, y0 + hl.head + 0.03, 0]} m={f} cast={false} />);
      pieces.push(<B key={k++} s={[w + 0.08, 0.06, t + 0.04]} p={[mid, y0 + hl.sill - 0.03, 0]} m={f} cast={false} />);
      if (hl.kind === 'window') {
        pieces.push(<B key={k++} s={[0.05, hh, 0.07]} p={[mid, my, 0]} m={f} cast={false} />);
        pieces.push(<B key={k++} s={[w + 0.3, 0.08, 0.45]} p={[mid, y0 + hl.head + 0.25, t / 2 + 0.2]} m={mat('concrete', { repeat: [1, 1] })} />);
      }
    }
    cx = hl.b;
  }
  box(cx, len, 0, h);
  return <group>{pieces}</group>;
}

// Gold diamond marker that floats above a zone.
export function Diamond({ p }: { p: V3 }) {
  return (
    <mesh position={p} rotation={[0, Math.PI / 4, 0]} material={mat('gold')}>
      <octahedronGeometry args={[0.7, 0]} />
    </mesh>
  );
}

const CAR_COLORS = ['#e8e6e1', '#1d2433', '#7a1f24', '#8d9399', '#2f4a6b'];
// A hatchback or sedan at true size (about 4.3 m long), built from shaped parts.
export function Car({ p, r = 0, color = 0 }: { p: V3; r?: number; color?: number }) {
  const paint = mat('plain', { color: CAR_COLORS[color % CAR_COLORS.length], roughness: 0.25, metalness: 0.6 });
  const tyre = mat('plain', { color: '#1a1a1c', roughness: 0.9 });
  const rim = mat('metal', { color: '#b9bec4', roughness: 0.3 });
  const glass = mat('plain', { color: '#22303d', roughness: 0.05, metalness: 0.7 });
  const lamp = mat('plain', { color: '#f4efe2', roughness: 0.2 });
  const tail = mat('plain', { color: '#9a1c1c', roughness: 0.3 });
  return (
    <group position={p} rotation={[0, r, 0]}>
      <B s={[1.78, 0.62, 4.3]} p={[0, 0.62, 0]} m={paint} />
      <B s={[1.74, 0.12, 4.32]} p={[0, 0.34, 0]} m={mat('plain', { color: '#222428', roughness: 0.8 })} />
      <B s={[1.58, 0.56, 2.2]} p={[0, 1.2, -0.25]} m={glass} />
      <B s={[1.6, 0.08, 2.0]} p={[0, 1.5, -0.3]} m={paint} />
      {[-0.62, 0.62].map((x) => <B key={x} s={[0.3, 0.12, 0.05]} p={[x, 0.75, 2.16]} m={lamp} cast={false} />)}
      {[-0.65, 0.65].map((x) => <B key={x} s={[0.28, 0.12, 0.05]} p={[x, 0.78, -2.16]} m={tail} cast={false} />)}
      {[[-0.82, 1.35], [0.82, 1.35], [-0.82, -1.35], [0.82, -1.35]].map(([x, z], i) => (
        <group key={i} position={[x, 0.33, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={tyre} castShadow><cylinderGeometry args={[0.33, 0.33, 0.22, 20]} /></mesh>
          <mesh material={rim} position={[0, x > 0 ? 0.115 : -0.115, 0]}><cylinderGeometry args={[0.2, 0.2, 0.02, 16]} /></mesh>
        </group>
      ))}
    </group>
  );
}

// A trimmed hedge along a line.
export function Hedge({ p, len, r = 0 }: { p: V3; len: number; r?: number }) {
  return <B s={[len, 0.8, 0.6]} p={[p[0], p[1] + 0.4, p[2]]} r={[0, r, 0]} m={mat('grass', { repeat: [len / 2, 1], color: '#7d9a62', roughness: 1, bump: 2 })} />;
}

// Static: after its children are built, merges every mesh that shares a material into one mesh,
// so a house of hundreds of boxes costs a handful of draw calls. Children marked userData.noMerge
// (anything that moves or is clicked) are left alone. deps: whatever changes the children's shape.
import { useLayoutEffect, useRef as useRefS } from 'react';
import { useThree } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export function Static({ children, deps = [] }: { children: ReactNode; deps?: unknown[] }) {
  const ref = useRefS<THREE.Group>(null);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    root.updateMatrixWorld(true);
    const inv = root.matrixWorld.clone().invert();
    const buckets = new Map<string, { mat: THREE.Material; cast: boolean; receive: boolean; geos: THREE.BufferGeometry[] }>();
    const hidden: THREE.Object3D[] = [];
    const frozen = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) if (p.userData.noMerge) return true; return false; };
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh || Array.isArray(m.material) || frozen(m) || !m.visible) return;
      const g = m.geometry.index ? m.geometry.clone() : null; if (!g) return;
      for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
      if (!g.attributes.normal || !g.attributes.uv) return;
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
      const key = `${m.material.uuid}|${m.castShadow}|${m.receiveShadow}`;
      if (!buckets.has(key)) buckets.set(key, { mat: m.material, cast: m.castShadow, receive: m.receiveShadow, geos: [] });
      buckets.get(key)!.geos.push(g); hidden.push(m);
    });
    const merged: THREE.Mesh[] = [];
    for (const b of buckets.values()) {
      const geo = b.geos.length === 1 ? b.geos[0] : mergeGeometries(b.geos, false);
      if (!geo) continue;
      const mesh = new THREE.Mesh(geo, b.mat); mesh.castShadow = b.cast; mesh.receiveShadow = b.receive; mesh.userData.merged = true;
      root.add(mesh); merged.push(mesh);
      if (geo !== b.geos[0]) b.geos.forEach((g) => g.dispose());
    }
    hidden.forEach((h) => { h.visible = false; });
    invalidate();
    return () => { merged.forEach((m) => { root.remove(m); m.geometry.dispose(); }); hidden.forEach((h) => { h.visible = true; }); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return <group ref={ref}>{children}</group>;
}
