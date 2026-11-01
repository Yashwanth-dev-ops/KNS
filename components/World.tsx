'use client';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Environment, Lightformer, Sky, Stars, Html, useProgress, PerformanceMonitor } from '@react-three/drei';
import { downFrom } from '../lib/gpu';
import { EffectComposer, N8AO, Bloom, ToneMapping, SMAA, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Ground, Trees, Lamps, Boundary, lampSpots } from './scene/Site';
import { Gate, Plots, Construction, Showroom, Duplex, Apartments, Office, Signposts, ProjectsPavilion } from './scene/Zones';
import { VillaWorld, villaPlots, plotCentre } from './scene/Villas';
import { mat } from '../lib/materials';
import { Static } from './scene/kit';
import { windowGlow, lampGlow } from '../lib/materials';
import { useWorld } from '../lib/store';
import { zones } from '../lib/content';

const OVERVIEW: [number, number, number, number, number, number] = [0, 5.2, 60.5, 0, 3.4, 40];

function Lighting() {
  const dusk = useWorld((s) => s.dusk);
  const quality = useWorld((s) => s.quality);
  const sunHour = useWorld((s) => s.sunHour);
  // Compass used across the world: north is toward the gate (+z), east is -x.
  const sunPos = useMemo(() => {
    if (sunHour == null) return null;
    const t = ((sunHour - 6) / 12) * Math.PI;
    return new THREE.Vector3(-Math.cos(t) * 100, Math.max(3, Math.sin(t) * 85), -Math.sin(t) * 40 - 8);
  }, [sunHour]);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const k = useRef(0);
  const { scene } = useThree();
  const day = useMemo(() => new THREE.Color('#cfdbe6'), []), night = useMemo(() => new THREE.Color('#0d1222'), []);
  useEffect(() => { scene.fog = new THREE.Fog(day.clone(), 140, 330); }, [scene, day]);
  const villas = useWorld((s) => s.villas);
  useFrame((_, dt) => {
    const fog = scene.fog as THREE.Fog; if (fog) { fog.near = villas ? 260 : 140; fog.far = villas ? 900 : 330; }
    k.current += ((dusk ? 1 : 0) - k.current) * Math.min(1, dt * 1.6);
    const t = k.current;
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(3.2, 0.12, t); sun.current.color.setHSL(0.09, 0.6, THREE.MathUtils.lerp(0.95, 0.55, t));
      const want = sunPos ?? new THREE.Vector3(60, 80, 40);
      sun.current.position.lerp(want, Math.min(1, dt * 6));
      if (sunPos) { const low = 1 - Math.min(1, sunPos.y / 60); sun.current.color.setHSL(0.08, 0.7, 0.95 - low * 0.25); }
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(0.9, 0.18, t);
    windowGlow.emissiveIntensity = t * 1.9;
    lampGlow.emissiveIntensity = 0.15 + t * 7;
    (scene.fog as THREE.Fog).color.copy(day).lerp(night, t);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#dfe9f5', '#5d6b45', 0.9]} />
      <directionalLight ref={sun} position={[60, 80, 40]} intensity={3.2} castShadow={quality !== 'minimal'}
        shadow-mapSize={quality === 'high' ? [2048, 2048] : [1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.04}
        shadow-camera-left={-90} shadow-camera-right={90} shadow-camera-top={90} shadow-camera-bottom={-90} shadow-camera-far={260} />
      {dusk && quality !== 'minimal' && lampSpots.filter((_, i) => i % 3 === 0).map(([x, z], i) => (
        <pointLight key={i} position={[x + (x < 0 ? 1.3 : -1.3), 5.8, z]} intensity={40} distance={18} decay={2} color="#ffcf8a" />
      ))}
      <Sky distance={4500} sunPosition={dusk ? [100, -4, -100] : sunPos ? [sunPos.x, sunPos.y, sunPos.z] : [100, 36, 60]} turbidity={dusk ? 9 : 5} rayleigh={dusk ? 3 : 1.4} mieCoefficient={0.006} mieDirectionalG={0.85} />
      {dusk && <Stars radius={260} depth={60} count={quality === 'minimal' ? 600 : 2500} factor={5} fade speed={0.4} />}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} position={[0, 30, -60]} scale={[120, 30, 1]} color="#dfe8f2" />
        <Lightformer intensity={1.2} position={[-60, 20, 40]} scale={[60, 20, 1]} rotation-y={Math.PI / 2} color="#f2e2c4" />
        <Lightformer intensity={0.6} position={[0, -5, 0]} rotation-x={Math.PI / 2} scale={[200, 200, 1]} color="#6f7d58" />
      </Environment>
    </>
  );
}

function Pins() {
  const phase = useWorld((s) => s.phase), zone = useWorld((s) => s.zone), setZone = useWorld((s) => s.setZone), villas = useWorld((s) => s.villas);
  if (phase !== 'explore' || villas || zone) return null;
  return (
    <>
      {zones.map((z) => (
        <Html key={z.id} position={z.pin} center zIndexRange={[20, 0]}>
          <button type="button" onClick={() => setZone(z.id)} tabIndex={-1}
            className={`group flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium shadow-lg backdrop-blur transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 ${zone === z.id ? 'border-gold-300 bg-gold-500 text-navy-950' : 'border-white/30 bg-navy-900/80 text-stone-50 hover:bg-navy-800'}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${zone === z.id ? 'bg-navy-900 text-gold-300' : 'bg-gold-500 text-navy-950'}`}>{z.n}</span>
            {z.short}
          </button>
        </Html>
      ))}
    </>
  );
}

const VILLA_VIEW: [number, number, number, number, number, number] = [70, 105, 175, 0, 0, 12];

function Rig() {
  const ref = useRef<CameraControls>(null);
  const phase = useWorld((s) => s.phase), setPhase = useWorld((s) => s.setPhase);
  const zone = useWorld((s) => s.zone), villas = useWorld((s) => s.villas), plot = useWorld((s) => s.plot);
  const { gl } = useThree();
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entry: parked outside the gate while the logo film plays, then the gates open and the camera glides in.
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.smoothTime = 1.1;
    if (phase === 'loading' || phase === 'film') c.setLookAt(0, 2.2, 96, 0, 8.5, 62, false);
    if (phase === 'entering') {
      if (reduce()) { c.setLookAt(...OVERVIEW, false); setPhase('explore'); return; }
      const t1 = setTimeout(() => { c.smoothTime = 1.6; c.setLookAt(0, 3.4, 68, 0, 3.4, 40, true); }, 1300);
      const t2 = setTimeout(() => { c.smoothTime = 1.4; c.setLookAt(...OVERVIEW, true); setPhase('explore'); }, 3600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phase, setPhase]);

  // Sections: fly to the chosen zone, or back to the overview.
  useEffect(() => {
    const c = ref.current; if (!c || phase !== 'explore' || villas) return;
    c.smoothTime = reduce() ? 0 : 1.0; c.maxDistance = 150;
    const z = zones.find((q) => q.id === zone);
    if (z) c.setLookAt(...z.view, ...z.focus, true); else c.setLookAt(...OVERVIEW, true);
  }, [zone, phase, villas]);

  // Apartments: stand on a balcony at that floor's height and look out.
  const floorView = useWorld((s) => s.floorView);
  useEffect(() => {
    const c = ref.current; if (!c || phase !== 'explore' || zone !== 'apartments') return;
    c.smoothTime = reduce() ? 0 : 1.0;
    if (floorView == null) { const z = zones.find((q) => q.id === 'apartments')!; c.setLookAt(...z.view, ...z.focus, true); return; }
    const y = 3 + (floorView - 1) * 3.1 + 1.6;
    c.setLookAt(-30 + 7 + 1.2, y, -37, 10, y - 2, -30, true);
  }, [floorView, zone, phase]);

  // The villa community: an aerial view, then down to a chosen plot.
  useEffect(() => {
    const c = ref.current; if (!c || phase !== 'explore' || !villas) return;
    c.smoothTime = reduce() ? 0 : 1.1; c.maxDistance = 400;
    const p = villaPlots.find((v) => v.n === plot);
    if (p) { const t = plotCentre(p); c.setLookAt(t.x + 16, 22, t.z + 30, t.x, 0, t.z, true); }
    else c.setLookAt(...VILLA_VIEW, true);
  }, [villas, plot, phase]);

  useEffect(() => { if (ref.current) ref.current.enabled = phase === 'explore'; }, [phase]);

  // Touching the world hands control back from the tour.
  useEffect(() => {
    const el = gl.domElement; const stop = () => { if (useWorld.getState().touring) useWorld.getState().setTouring(false); };
    el.addEventListener('pointerdown', stop); el.addEventListener('wheel', stop, { passive: true });
    return () => { el.removeEventListener('pointerdown', stop); el.removeEventListener('wheel', stop); };
  }, [gl]);

  return <CameraControls ref={ref} makeDefault minDistance={4} maxDistance={150} maxPolarAngle={1.47} dollySpeed={0.6} truckSpeed={1.2} />;
}

function Loaded() {
  const { active, progress } = useProgress();
  const setLoaded = useWorld((s) => s.setLoaded), setProgress = useWorld((s) => s.setProgress);
  useEffect(() => { setProgress(Math.round(progress)); }, [progress, setProgress]);
  // This component only mounts once everything inside the Suspense boundary has loaded, so mounting is the signal.
  // (Some phones never report loader progress, which left the gate stuck at 0%.)
  useEffect(() => { setLoaded(true); }, [setLoaded]);
  useEffect(() => { if (!active && progress === 100) setLoaded(true); }, [active, progress, setLoaded]);
  return null;
}

function ShowroomMerged() {
  const d = useWorld((s) => s.design);
  return <Static deps={[d.tile, d.granite, d.paint, d.door]}><Showroom /></Static>;
}

// Applies the quality level to the running renderer, without rebuilding the canvas.
// Fastest mode also swaps the physically based materials for simpler ones (same colours and textures,
// much cheaper per pixel), which is what decides speed on phones and software rendering.
const simple = new WeakMap<THREE.Material, THREE.Material>();
function swapMaterials(scene: THREE.Scene, toSimple: boolean) {
  scene.traverse((o) => {
    const m = o as THREE.Mesh; if (!m.isMesh || Array.isArray(m.material)) return;
    if (toSimple) {
      const src = m.material as THREE.MeshStandardMaterial;
      if (!src.isMeshStandardMaterial || m.userData.full || src === windowGlow || src === lampGlow) return;
      let lam = simple.get(src) as THREE.MeshLambertMaterial | undefined;
      if (!lam) { lam = new THREE.MeshLambertMaterial({ color: src.color, map: src.map, transparent: src.transparent, opacity: src.opacity, emissive: src.emissive, emissiveMap: src.emissiveMap, emissiveIntensity: src.emissiveIntensity }); simple.set(src, lam); }
      m.userData.full = src; m.material = lam;
    } else if (m.userData.full) { m.material = m.userData.full; delete m.userData.full; }
  });
}
function QualitySync() {
  const quality = useWorld((s) => s.quality);
  const { gl, scene, invalidate } = useThree();
  const env = useRef<THREE.Texture | null>(null);
  useEffect(() => {
    const minimal = quality === 'minimal';
    // With no post-processing pass in the fastest mode, the renderer does the tone mapping itself.
    gl.toneMapping = minimal ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
    if (minimal) { if (scene.environment) env.current = scene.environment; scene.environment = null; }
    else if (env.current) scene.environment = env.current;
    swapMaterials(scene, minimal);
    scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m && !Array.isArray(m)) m.needsUpdate = true; });
    invalidate();
  }, [quality, gl, scene, invalidate]);
  // Parts built later (a new house design, the villa view) get the same treatment.
  const tick = useRef(0);
  useFrame((_, dt) => {
    if (quality !== 'minimal') return;
    tick.current += dt; if (tick.current < 1) return; tick.current = 0;
    if (scene.environment) { env.current = scene.environment; scene.environment = null; }
    swapMaterials(scene, true);
  });
  return null;
}

function Effects() {
  const quality = useWorld((s) => s.quality);
  if (quality === 'minimal') return null;
  if (quality === 'lite') return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.6} luminanceThreshold={0.9} mipmapBlur />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
  return (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={1.6} intensity={2.4} distanceFalloff={0.6} halfRes />
      <Bloom intensity={0.75} luminanceThreshold={0.88} luminanceSmoothing={0.2} mipmapBlur />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
      <Vignette offset={0.25} darkness={0.55} />
    </EffectComposer>
  );
}

export default function World() {
  const quality = useWorld((s) => s.quality), setQuality = useWorld((s) => s.setQuality);
  const minimal = quality === 'minimal';
  const villas = useWorld((s) => s.villas);
  return (
    <Canvas shadows={minimal ? false : { type: THREE.PCFSoftShadowMap }} flat
      dpr={quality === 'high' ? [1, 1.75] : quality === 'lite' ? [1, 1.25] : 0.65}
      gl={{ antialias: minimal, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      onCreated={({ gl, scene, camera }) => {
        (window as unknown as { __knsGl: unknown }).__knsGl = { gl, scene, camera };
        // If the graphics driver drops the 3D context, fall back to the page instead of a frozen screen.
        const cv = gl.domElement;
        cv.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          // A quality change rebuilds the canvas and drops the old context on purpose; only a canvas still on screen has really crashed.
          setTimeout(() => { if (!cv.isConnected) return; const st = useWorld.getState(); st.setNotice('The 3D view stopped on this device, so here is the page version.'); st.setPageView(true); }, 300);
        }, { once: true });
      }}
      camera={{ fov: 42, near: 0.3, far: 1200, position: [0, 2.2, 96] }}
>
      {!minimal && (
        <PerformanceMonitor flipflops={2} onDecline={() => setQuality(downFrom(useWorld.getState().quality))} onFallback={() => setQuality('minimal')} />
      )}
      <Lighting />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow material={mat('grass', { repeat: [200, 200], roughness: 1, bump: 0.8 })}>
        <planeGeometry args={[1400, 1400]} />
      </mesh>
      <Suspense fallback={null}>
        <group visible={!villas}>
          <Static><Ground /><Boundary /><Lamps /><Gate /><Signposts /><ProjectsPavilion /><Plots /><Construction /><Duplex /><Apartments /><Office /></Static>
          <Trees />
          <ShowroomMerged />
        </group>
        {villas && <VillaWorld />}
        <Loaded />
      </Suspense>
      <Pins />
      <Rig />
      <Effects />
    </Canvas>
  );
}
