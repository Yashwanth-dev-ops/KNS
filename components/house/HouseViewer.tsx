'use client';
// The 3D G+1: look at it from outside, lift the roof or the first floor off, or step into a room
// and compare it with the design render it was built from.
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Lightformer } from '@react-three/drei';
import { HouseModel, type HouseMode } from './HouseModel';
import { detectQuality, type Quality } from '../../lib/gpu';
import { wa } from '../../lib/content';

type V6 = [number, number, number, number, number, number];
type View = { id: string; label: string; mode: HouseMode; at: V6; inside?: boolean; img: string; alt: string; title: string; spec: string[] };

const VIEWS: View[] = [
  { id: 'outside', label: 'Outside', mode: 'outside', at: [14, 8, 22, 0, 4, 1], img: 'exterior', alt: 'Design render of the G+1 front elevation with wood fins and a slate frame', title: 'The front elevation',
    spec: ['Slate-grey frame around the first-floor balcony', 'Full-height wood fins on the corner', 'Jaali panels at the gate and balcony', 'Covered car porch'] },
  { id: 'first', label: 'First floor', mode: 'first', at: [10, 22, 16, 0, 3.5, 0], img: 'bedroom', alt: 'Design render of the master bedroom', title: 'First floor, roof lifted',
    spec: ['Master bedroom with wardrobe and dresser', 'Second bedroom', 'Lounge opening onto the front balcony'] },
  { id: 'ground', label: 'Ground floor', mode: 'ground', at: [10, 18, 15, 0, 0.5, 0], img: 'living', alt: 'Design render of the living room', title: 'Ground floor, first floor lifted',
    spec: ['Living room with TV wall and staircase', 'Kitchen at the back left', 'Dining between them', 'Guest bedroom'] },
  { id: 'living', label: 'Living room', mode: 'ground', inside: true, at: [1.0, 2.05, 5.8, 0.8, 1.5, 0.3], img: 'living', alt: 'Design render of the living room with a marble TV wall and wood slats', title: 'Living room',
    spec: ['Marble TV wall with dark-wood slats', 'False ceiling with cove light', 'Marble staircase with a glass rail'] },
  { id: 'kitchen', label: 'Kitchen', mode: 'ground', inside: true, at: [-1.6, 2.05, -2.45, -3.4, 1.0, -6.0], img: 'kitchen', alt: 'Design render of the L-shaped modular kitchen', title: 'Kitchen',
    spec: ['L-shaped modular units', 'Black granite counter', 'Marble dado', 'Tall glass-front unit'] },
  { id: 'bedroom', label: 'Bedroom', mode: 'first', inside: true, at: [3.6, 5.2, -1.0, 1.9, 4.4, -6.2], img: 'bedroom', alt: 'Design render of the master bedroom with a padded headboard and chevron wardrobe', title: 'Master bedroom',
    spec: ['Padded headboard on a wood panel', 'Wardrobe with lofts', 'Dresser with mirror', 'Ceiling fan and downlights'] },
];

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function Rig({ view }: { view: View }) {
  const ref = useRef<CameraControls>(null);
  const narrow = useThree((s) => s.size.width < s.size.height); // portrait phones need the camera further back
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.minDistance = view.inside ? 0.2 : 4;
    c.maxDistance = view.inside ? 6 : 60;
    c.smoothTime = 0.9;
    const [x, y, z, tx, ty, tz] = view.at, k = narrow && !view.inside ? 1.7 : 1;
    c.setLookAt(tx + (x - tx) * k, ty + (y - ty) * k, tz + (z - tz) * k, tx, ty, tz, !reduced());
  }, [view, narrow]);
  return <CameraControls ref={ref} makeDefault maxPolarAngle={1.5} dollySpeed={0.5} />;
}

export default function HouseViewer() {
  const [id, setId] = useState('outside');
  const [quality, setQuality] = useState<Quality>('high');
  useEffect(() => setQuality(detectQuality()), []);
  const view = VIEWS.find((v) => v.id === id)!;
  const minimal = quality === 'minimal';
  const btn = (v: View) => (
    <button key={v.id} type="button" aria-pressed={v.id === id} onClick={() => setId(v.id)}
      className="rounded-md border border-navy-900/20 px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-navy-900/5 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 aria-pressed:border-navy-900 aria-pressed:bg-navy-900 aria-pressed:text-stone-50">
      {v.label}
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <div>
        <div className="relative h-[62vh] min-h-[360px] overflow-hidden rounded-lg bg-mist" data-house-canvas>
          <Canvas shadows={!minimal} dpr={minimal ? 0.65 : [1, 1.75]} camera={{ fov: 50, position: [14, 8, 22], near: 0.05, far: 300 }}
            gl={{ antialias: !minimal, toneMapping: THREE.ACESFilmicToneMapping }} aria-label={`3D model of the house: ${view.title}`} role="img">
            <color attach="background" args={['#cfd9e2']} />
            <hemisphereLight args={['#eef3f8', '#8a8f78', 0.9]} />
            <directionalLight position={[18, 26, 14]} intensity={2.2} castShadow={!minimal} shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-bias={-0.0004} />
            {!minimal && (
              <Environment resolution={128} frames={1}>
                <Lightformer intensity={2} position={[0, 30, -60]} scale={[120, 30, 1]} color="#dfe8f2" />
                <Lightformer intensity={1.1} position={[-60, 20, 40]} scale={[60, 20, 1]} rotation-y={Math.PI / 2} color="#f2e2c4" />
              </Environment>
            )}
            <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[120, 120]} />
              <meshStandardMaterial color="#9aa58a" roughness={1} />
            </mesh>
            <Suspense fallback={null}><HouseModel mode={view.mode} /></Suspense>
            <Rig view={view} />
          </Canvas>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded bg-navy-950/70 px-2 py-1 text-xs text-stone-50">Drag to turn, scroll or pinch to zoom</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Whole house">{VIEWS.filter((v) => !v.inside).map(btn)}</div>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Step inside">{VIEWS.filter((v) => v.inside).map(btn)}</div>
      </div>

      <aside aria-live="polite">
        <figure>
          <img src={`../photos/design/${view.img}.jpg`} alt={view.alt} width={1024} height={1024} className="aspect-square w-full rounded-lg object-cover" />
          <figcaption className="mt-2 text-sm text-navy-900/65">Design render, not a photo of a finished home.</figcaption>
        </figure>
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">{view.title}</h2>
        <ul className="mt-3 grid gap-1.5 text-navy-900/80">{view.spec.map((s) => <li key={s}>{s}</li>)}</ul>
        <a href={wa(`Hello KNS, I saw the 3D house on your website. I would like a home like this (${view.title}).`)}
          className="mt-6 inline-block rounded-md bg-gold-500 px-5 py-3 font-semibold text-navy-950 transition-colors duration-150 hover:bg-gold-400 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900">
          Ask about this design
        </a>
      </aside>
    </div>
  );
}
