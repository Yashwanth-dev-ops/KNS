'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { B } from './kit';
import { mat, lampGlow } from '../../lib/materials';

let s = 11;
const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat('grass', { repeat: [90, 90], roughness: 1, bump: 0.8 })}>
        <planeGeometry args={[420, 420]} />
      </mesh>
      {/* main drive from the public road, through the gate, to the office */}
      <B s={[10, 0.06, 180]} p={[0, 0.03, 18]} m={mat('asphalt', { repeat: [3, 54], roughness: 0.92 })} cast={false} />
      <B s={[200, 0.06, 10]} p={[0, 0.03, 108]} m={mat('asphalt', { repeat: [60, 3], roughness: 0.92 })} cast={false} />
      {/* footpaths */}
      {[-6.2, 6.2].map((x) => <B key={x} s={[2.4, 0.16, 118]} p={[x, 0.08, -2]} m={mat('paving', { repeat: [1, 48] })} cast={false} />)}
      {/* side drives to each zone */}
      {[[-1, 34], [1, 10], [-1, -2], [1, -32], [-1, -40]].map(([side, z], i) => (
        <B key={i} s={[12, 0.05, 6]} p={[side * 12, 0.03, z]} m={mat('asphalt', { repeat: [4, 2], roughness: 0.92 })} cast={false} />
      ))}
      {[-5.1, 5.1].map((x) => <B key={`k${x}`} s={[0.22, 0.18, 168]} p={[x, 0.09, 22]} m={mat('concrete', { repeat: [1, 60], color: '#d9d5cc' })} cast={false} />)}
      <Shrubs />
      <LaneMarks />
    </group>
  );
}

function LaneMarks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const zs = useMemo(() => { const a: number[] = []; for (let z = 104; z > -50; z -= 6) a.push(z); return a; }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    zs.forEach((z, i) => { m.makeTranslation(0, 0.07, z); ref.current!.setMatrixAt(i, m); });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [zs]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, zs.length]} receiveShadow>
      <boxGeometry args={[0.18, 0.01, 2.6]} />
      <meshStandardMaterial color="#e9e4d6" roughness={0.7} />
    </instancedMesh>
  );
}

function Shrubs() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => { const a: [number, number, number][] = []; for (let z = 58; z > -50; z -= 3.1) { a.push([-7.9 - rnd() * 0.3, z, 0.5 + rnd() * 0.3]); a.push([7.9 + rnd() * 0.3, z + 1.5, 0.5 + rnd() * 0.3]); } return a; }, []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.7, 2), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), c = new THREE.Color();
    spots.forEach(([x, z, k], i) => { m.compose(p.set(x, 0.35 * k, z), q, sc.set(k * 1.2, k, k * 1.2)); ref.current!.setMatrixAt(i, m); c.setHSL(0.25 + rnd() * 0.05, 0.35, 0.28 + rnd() * 0.08); ref.current!.setColorAt(i, c); });
    ref.current!.instanceMatrix.needsUpdate = true; if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [spots]);
  return <instancedMesh ref={ref} args={[geo, undefined, spots.length]} castShadow receiveShadow><meshStandardMaterial roughness={0.95} /></instancedMesh>;
}

export function Trees() {
  const spots = useMemo(() => {
    const a: [number, number, number][] = [];
    for (let z = 54; z > -52; z -= 11) { a.push([-9.5, z, 1]); a.push([9.5, z + 5, 1]); }
    for (let i = 0; i < 70; i++) {
      const ang = rnd() * Math.PI * 2, r = 70 + rnd() * 60;
      a.push([Math.cos(ang) * r, Math.sin(ang) * r - 5, 0.9 + rnd() * 0.8]);
    }
    for (let i = 0; i < 26; i++) a.push([-50 + rnd() * 100, 120 + rnd() * 40, 1 + rnd() * 0.6]);
    return a;
  }, []);
  const trunk = useRef<THREE.InstancedMesh>(null), crownA = useRef<THREE.InstancedMesh>(null), crownB = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    const c = new THREE.Color();
    spots.forEach(([x, z, k], i) => {
      q.setFromEuler(new THREE.Euler(0, rnd() * 6, 0));
      m.compose(p.set(x, 0, z), q, sc.set(k, k, k)); trunk.current!.setMatrixAt(i, m);
      m.compose(p.set(x, 3.2 * k, z), q, sc.set(k * (1 + rnd() * 0.3), k * (0.9 + rnd() * 0.3), k)); crownA.current!.setMatrixAt(i, m);
      m.compose(p.set(x + 0.7 * k, 4.5 * k, z - 0.5 * k), q, sc.set(k * 0.7, k * 0.7, k * 0.7)); crownB.current!.setMatrixAt(i, m);
      c.setHSL(0.22 + rnd() * 0.07, 0.32 + rnd() * 0.14, 0.2 + rnd() * 0.07);
      crownA.current!.setColorAt(i, c); crownB.current!.setColorAt(i, c.offsetHSL(0, 0, 0.04));
    });
    for (const r of [trunk, crownA, crownB]) { r.current!.instanceMatrix.needsUpdate = true; if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true; }
  }, [spots]);
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.92 }), []);
  const crownGeo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1.9, 3);
    const pos = g.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 2.1) * Math.cos(v.y * 2.7) * Math.sin(v.z * 1.9);
      v.multiplyScalar(1 + n * 0.22 + (Math.sin(i * 12.9898) * 0.5) * 0.08);
      v.y *= 0.82; pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return g;
  }, []);
  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, spots.length]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 3.2, 7]} />
        <meshStandardMaterial color="#5b4532" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crownA} args={[crownGeo, leaf, spots.length]} castShadow receiveShadow />
      <instancedMesh ref={crownB} args={[crownGeo, leaf, spots.length]} castShadow receiveShadow />
    </group>
  );
}

export const lampSpots: [number, number][] = (() => { const a: [number, number][] = []; for (let z = 50; z > -50; z -= 16) { a.push([-7.6, z]); a.push([7.6, z - 8]); } return a; })();

export function Lamps() {
  const pole = mat('metal', { color: '#2a2f38', roughness: 0.45 });
  return (
    <group>
      {lampSpots.map(([x, z], i) => {
        const dir = x < 0 ? 1 : -1;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 3.2, 0]} material={pole} castShadow><cylinderGeometry args={[0.06, 0.09, 6.4, 8]} /></mesh>
            <B s={[1.4, 0.08, 0.08]} p={[dir * 0.65, 6.35, 0]} m={pole} />
            <B s={[0.6, 0.12, 0.3]} p={[dir * 1.3, 6.28, 0]} m={pole} />
            <B s={[0.5, 0.04, 0.24]} p={[dir * 1.3, 6.2, 0]} m={lampGlow} cast={false} />
          </group>
        );
      })}
    </group>
  );
}

export function Boundary() {
  const wall = mat('plaster', { repeat: [40, 1], color: '#e6dfd1' });
  return (
    <group>
      {/* front wall either side of the gate, and the plot's long sides */}
      <B s={[70, 2.4, 0.4]} p={[-43.2, 1.2, 62]} m={wall} />
      <B s={[70, 2.4, 0.4]} p={[43.2, 1.2, 62]} m={wall} />
      <B s={[0.4, 2.4, 150]} p={[-78, 1.2, -13]} m={wall} />
      <B s={[0.4, 2.4, 150]} p={[78, 1.2, -13]} m={wall} />
      <B s={[156, 2.4, 0.4]} p={[0, 1.2, -88]} m={wall} />
      <B s={[70, 0.12, 0.5]} p={[-43.2, 2.45, 62]} m={mat('gold')} />
      <B s={[70, 0.12, 0.5]} p={[43.2, 2.45, 62]} m={mat('gold')} />
    </group>
  );
}

