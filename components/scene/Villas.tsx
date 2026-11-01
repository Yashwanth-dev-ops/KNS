'use client';
// KNS Premium Villa Community, Ganapatiguda: the 91 plots the concept layout draws, numbered as drawn,
// at the stated sizes (30 ft by 75 ft plots, 40 ft and 30 ft roads). Working units are feet, shown in metres.
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { mat, windowGlow, lampGlow } from '../../lib/materials';
import { useWorld } from '../../lib/store';

const FT = 0.3048, CX = 385, CZ = 400;
const w = (x: number, z: number) => [(x - CX) * FT, (z - CZ) * FT] as const;

export type VPlot = { n: number; x: number; z: number; w: number; d: number; front: 'n' | 's' | 'w' };
export const villaPlots: VPlot[] = (() => {
  const a: VPlot[] = [];
  const along = (nums: number[], x0: number, z0: number, front: VPlot['front']) => nums.forEach((n, i) => a.push({ n, x: x0 + i * 30, z: z0, w: 30, d: 75, front }));
  const down = (nums: number[], x0: number, z0: number, front: VPlot['front']) => nums.forEach((n, i) => a.push({ n, x: x0, z: z0 + i * 30, w: 75, d: 30, front }));
  const r = (p: number, q: number) => Array.from({ length: q - p + 1 }, (_, i) => p + i);
  along(r(1, 15), 300, 0, 's');
  along(r(16, 19), 40, 115, 'n'); along(r(20, 23), 200, 115, 'n'); along(r(24, 28), 360, 115, 'n');
  along(r(35, 38), 40, 190, 's'); along(r(39, 42), 200, 190, 's'); along(r(43, 47), 360, 190, 's');
  down(r(29, 34), 550, 115, 'w');
  along([48, 50], 100, 305, 'n'); along(r(52, 55), 200, 305, 'n'); along(r(56, 60), 360, 305, 'n');
  along([61, 62], 200, 420, 'n'); along(r(65, 69), 360, 420, 'n'); along([71, 72], 550, 420, 'n');
  along(r(74, 85), 200, 535, 'n');
  along(r(86, 88), 200, 640, 'n'); along(r(90, 92), 320, 640, 'n'); along(r(94, 97), 440, 640, 'n');
  along([98, 100], 200, 715, 's');
  return a;
})();
export const plotCentre = (p: VPlot) => { const [x, z] = w(p.x + p.w / 2, p.z + p.d / 2); return new THREE.Vector3(x, 0, z); };

function Flat({ x, z, wd, dp, m, y = 0.02 }: { x: number; z: number; wd: number; dp: number; m: THREE.Material; y?: number }) {
  const [px, pz] = w(x + wd / 2, z + dp / 2);
  return <mesh position={[px, y, pz]} rotation={[-Math.PI / 2, 0, 0]} material={m} receiveShadow><planeGeometry args={[wd * FT, dp * FT]} /></mesh>;
}
function Block({ x, z, wd, dp, h, m }: { x: number; z: number; wd: number; dp: number; h: number; m: THREE.Material }) {
  const [px, pz] = w(x + wd / 2, z + dp / 2);
  return <mesh position={[px, h / 2, pz]} material={m} castShadow receiveShadow><boxGeometry args={[wd * FT, h, dp * FT]} /></mesh>;
}

function labelTexture(n: number) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d')!;
  x.fillStyle = 'rgba(20,25,43,0.82)'; x.beginPath(); x.roundRect(14, 8, 100, 48, 12); x.fill();
  x.font = '600 34px Inter, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#e3cf9a';
  x.fillText(String(n).padStart(2, '0'), 64, 33);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function VillaWorld() {
  const plot = useWorld((s) => s.plot), setPlot = useWorld((s) => s.setPlot), raise = useWorld((s) => s.raise);
  const [hover, setHover] = useState<number | null>(null);
  const road = mat('asphalt', { repeat: [20, 2], roughness: 0.92 });
  const padM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#efe6d2', roughness: 0.9 }), []);
  const padHot = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9a043', roughness: 0.5, metalness: 0.3 }), []);
  const labels = useMemo(() => new Map(villaPlots.map((p) => [p.n, labelTexture(p.n)])), []);
  const boundary: [number, number][] = [[0, 75], [290, 75], [290, -5], [770, -5], [770, 495], [690, 495], [690, 795], [205, 805], [150, 805], [150, 495], [0, 495], [0, 75]];
  const roads: [number, number, number, number][] = [
    [0, 75, 770, 40], [0, 265, 550, 40], [0, 380, 640, 40], [160, 495, 530, 40],
    [160, 75, 40, 730], [320, 75, 40, 460], [510, 75, 40, 460],
    [160, 610, 440, 30], [290, 640, 30, 150], [410, 640, 30, 75], [-300, 805, 760, 40], [160, 845, 40, 300],
  ];

  // villas rise from the entry outwards
  const body = useRef<THREE.InstancedMesh>(null), roof = useRef<THREE.InstancedMesh>(null), glass = useRef<THREE.InstancedMesh>(null);
  const order = useMemo(() => { const o = villaPlots.map((p, i) => ({ i, d: Math.hypot(p.x - 180, p.z - 800) })).sort((a, b) => a.d - b.d); const m = new Map<number, number>(); o.forEach((v, k) => m.set(v.i, k)); return m; }, []);
  const M = useMemo(() => new THREE.Matrix4(), []), Q = useMemo(() => new THREE.Quaternion(), []), V = useMemo(() => new THREE.Vector3(), []), SC = useMemo(() => new THREE.Vector3(), []);
  const place = (rise: (i: number) => number) => {
    villaPlots.forEach((p, i) => {
      const h = Math.max(0.001, rise(i));
      const c = plotCentre(p); const vert = p.w < p.d;
      const fw = (vert ? p.w - 6 : p.w - 22) * FT, fd = (vert ? p.d - 22 : p.d - 6) * FT;
      const off = 4 * FT, ox = p.front === 'w' ? off : 0, oz = p.front === 'n' ? off : p.front === 's' ? -off : 0;
      M.compose(V.set(c.x + ox, 0.15, c.z + oz), Q, SC.set(fw, 6.4 * h, fd)); body.current!.setMatrixAt(i, M);
      M.compose(V.set(c.x + ox, 0.15 + 6.4 * h, c.z + oz), Q, SC.set(fw + 0.5, 0.3 * h, fd + 0.5)); roof.current!.setMatrixAt(i, M);
      const gz = p.front === 'n' ? c.z + oz - fd / 2 - 0.02 : p.front === 's' ? c.z + oz + fd / 2 + 0.02 : c.z;
      const gx = p.front === 'w' ? c.x + ox - fw / 2 - 0.02 : c.x + ox;
      const gw = p.front === 'w' ? 0.05 : fw * 0.72, gd = p.front === 'w' ? fd * 0.72 : 0.05;
      M.compose(V.set(gx, 0.15 + 1.2 * h, gz), Q, SC.set(gw, 1.6 * h, gd)); glass.current!.setMatrixAt(i * 2, M);
      M.compose(V.set(gx, 0.15 + 4.2 * h, gz), Q, SC.set(gw, 1.6 * h, gd)); glass.current!.setMatrixAt(i * 2 + 1, M);
    });
    for (const r of [body, roof, glass]) r.current!.instanceMatrix.needsUpdate = true;
  };
  const anim = useRef({ start: -1, running: true });
  useLayoutEffect(() => { anim.current = { start: -1, running: true }; }, [raise]);
  useFrame((st) => {
    const A = anim.current; if (!A.running || !body.current) return;
    for (const r of [body, roof, glass]) r.current!.visible = raise;
    if (!raise) { place(() => 0.001); A.running = false; return; }
    if (A.start < 0) A.start = st.clock.elapsedTime;
    const el = (st.clock.elapsedTime - A.start) * 1000;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = true;
    place((i) => { const v = reduce ? 1 : Math.min(1, Math.max(0, (el - order.get(i)! * 18) / 650)); if (v < 1) done = false; return 1 - Math.pow(1 - v, 3); });
    if (done) A.running = false;
  });

  // trees along the boundary and in the park
  const trees = useMemo(() => {
    const a: [number, number][] = [];
    for (let i = 0; i < boundary.length - 1; i++) {
      const [ax, az] = boundary[i], [bx, bz] = boundary[i + 1]; const len = Math.hypot(bx - ax, bz - az);
      for (let t = 18; t < len - 10; t += 30) a.push([ax + ((bx - ax) * t) / len, az + ((bz - az) * t) / len]);
    }
    for (let i = 0; i < 8; i++) a.push([12 + (i % 4) * 16, 432 + (i > 3 ? 42 : 0)]);
    return a;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const treeRef = useRef<THREE.InstancedMesh>(null), trunkRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    trees.forEach(([x, z], i) => {
      const [px, pz] = w(x, z); const s = 0.9 + ((i * 37) % 10) / 20;
      M.compose(V.set(px, 3.2 * s, pz), Q, SC.set(s, s * 0.9, s)); treeRef.current!.setMatrixAt(i, M);
      M.compose(V.set(px, 0, pz), Q, SC.set(s, s, s)); trunkRef.current!.setMatrixAt(i, M);
      c.setHSL(0.24 + ((i * 13) % 7) / 100, 0.35, 0.24 + ((i * 7) % 9) / 100); treeRef.current!.setColorAt(i, c);
    });
    treeRef.current!.instanceMatrix.needsUpdate = trunkRef.current!.instanceMatrix.needsUpdate = true;
    if (treeRef.current!.instanceColor) treeRef.current!.instanceColor.needsUpdate = true;
  }, [trees]); // eslint-disable-line react-hooks/exhaustive-deps

  const pts = boundary.map(([x, z]) => { const [a, b] = w(x, z); return [a, 0.08, b] as [number, number, number]; });
  return (
    <group>
      <Flat x={-20} z={-20} wd={810} dp={840} m={mat('soil', { repeat: [30, 30], color: '#d8c6a6' })} y={0.005} />
      <Line points={pts} color="#c9a043" lineWidth={2.5} dashed dashSize={2} gapSize={1.2} />
      {roads.map(([x, z, wd, dp], i) => <Flat key={i} x={x} z={z} wd={wd} dp={dp} m={road} y={0.03} />)}
      {/* amenities from the legend */}
      <Flat x={0} z={420} wd={80} dp={75} m={mat('grass', { repeat: [4, 4] })} y={0.035} />
      <Block x={82} z={430} wd={46} dp={40} h={5.5} m={mat('plaster', { color: '#efe9de' })} />
      <Block x={130} z={430} wd={30} dp={52} h={0.3} m={mat('concrete')} />
      <Flat x={134} z={434} wd={22} dp={44} m={mat('plain', { color: '#5f9fb8', roughness: 0.1, metalness: 0.2 })} y={0.32} />
      <Flat x={260} z={420} wd={60} dp={75} m={mat('grass', { repeat: [3, 3] })} y={0.035} />
      <Block x={615} z={432} wd={60} dp={50} h={3.6} m={mat('concrete')} />
      <Block x={118} z={742} wd={26} dp={26} h={3} m={mat('plaster', { color: '#efe9de' })} />
      <Block x={150} z={798} wd={8} dp={8} h={4.2} m={mat('brick', { repeat: [1, 2] })} />
      <Block x={202} z={798} wd={8} dp={8} h={4.2} m={mat('brick', { repeat: [1, 2] })} />
      {/* the plots */}
      {villaPlots.map((p) => {
        const c = plotCentre(p); const on = plot === p.n || hover === p.n;
        return (
          <group key={p.n}>
            <mesh position={[c.x, 0.08, c.z]} material={on ? padHot : padM} receiveShadow
              onClick={(e) => { e.stopPropagation(); setPlot(p.n); }}
              onPointerOver={(e) => { e.stopPropagation(); setHover(p.n); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { setHover(null); document.body.style.cursor = ''; }}>
              <boxGeometry args={[p.w * FT - 0.3, 0.14, p.d * FT - 0.3]} />
            </mesh>
            <sprite position={[c.x, raise ? 9 : 1.6, c.z]} scale={[3.4, 1.7, 1]} renderOrder={5}>
              <spriteMaterial map={labels.get(p.n)} depthWrite={false} transparent />
            </sprite>
          </group>
        );
      })}
      <instancedMesh ref={body} args={[undefined, mat('plaster', { color: '#f1ece2' }), villaPlots.length]} castShadow receiveShadow visible={false}><boxGeometry args={[1, 1, 1]} /></instancedMesh>
      <instancedMesh ref={roof} args={[undefined, mat('concrete'), villaPlots.length]} castShadow visible={false}><boxGeometry args={[1, 1, 1]} /></instancedMesh>
      <instancedMesh ref={glass} args={[undefined, windowGlow, villaPlots.length * 2]} visible={false}><boxGeometry args={[1, 1, 1]} /></instancedMesh>
      <instancedMesh ref={treeRef} args={[undefined, undefined, trees.length]} castShadow><icosahedronGeometry args={[2.2, 2]} /><meshStandardMaterial roughness={0.95} /></instancedMesh>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow><cylinderGeometry args={[0.18, 0.26, 3.2, 7]} /><meshStandardMaterial color="#5b4532" roughness={1} /></instancedMesh>
      {/* street lights on the main roads */}
      {[[180, 150], [180, 320], [180, 470], [180, 640], [300, 515], [450, 515], [600, 515], [300, 95], [450, 95], [620, 95]].map(([x, z], i) => {
        const [px, pz] = w(x, z);
        return (
          <group key={i} position={[px, 0, pz]}>
            <mesh position={[0, 3, 0]} material={mat('metal', { color: '#2a2f38' })}><cylinderGeometry args={[0.07, 0.1, 6, 8]} /></mesh>
            <mesh position={[0, 6.05, 0]} material={lampGlow}><sphereGeometry args={[0.25, 12, 10]} /></mesh>
          </group>
        );
      })}
    </group>
  );
}
