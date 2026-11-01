'use client';
// A G+1 or G+2 house of any footprint, front facing local +z.
// premium: stone-clad pier, timber band, glass balcony, facade lights. shell: bare brick, no finishes (build stage).
import { useMemo } from 'react';
import { B, Wall, Cyl, Car, Hedge, Static, type Hole } from './kit';
import { mat, windowGlow, lampGlow } from '../../lib/materials';

type Props = { W?: number; D?: number; floors?: number; premium?: boolean; shell?: boolean; grounds?: boolean; paint?: string };

export function House({ W = 9, D = 13, floors = 2, premium = true, shell = false, grounds = true, paint = '#f3eee4' }: Props) {
  const plaster = useMemo(() => mat('plaster', { repeat: [3, 2], color: paint, bump: 0.15 }), [paint]);
  const brick = useMemo(() => mat('brick', { repeat: [3, 2], bump: 1.2 }), []);
  const wallM = shell ? brick : plaster;
  const accent = useMemo(() => mat('teak', { repeat: [2, 4], roughness: 0.5 }), []);
  const stoneClad = useMemo(() => mat('brick', { repeat: [1, 3], roughness: 0.85, bump: 1.2, color: '#d8c7ad' }), []);
  const conc = useMemo(() => mat('concrete', { repeat: [3, 3] }), []);
  const P = 0.45, F = 3.1, hw = W / 2, hd = D / 2;
  const levels = Array.from({ length: floors }, (_, i) => P + i * F);
  const roof = P + floors * F;
  const kind = (k: Hole['kind']) => (shell ? 'open' : k) as Hole['kind'];
  const win = (a: number, b: number): Hole => ({ a, b, sill: 0.9, head: 2.2, kind: kind('window') });
  // Openings spaced along a wall of length L.
  const spread = (L: number, n: number, w: number) => Array.from({ length: n }, (_, i) => { const c = (L * (i + 1)) / (n + 1); return win(c - w / 2, c + w / 2); });
  const frontHoles = (lv: number): Hole[] => lv === 0
    ? [{ a: W * 0.12, b: W * 0.12 + 1.1, sill: 0, head: 2.2, kind: kind('door') }, win(W * 0.48, W * 0.88)]
    : [{ a: W * 0.29, b: W * 0.71, sill: 0, head: 2.3, kind: kind('glassdoor') }];
  const nSide = Math.max(2, Math.round(D / 4.3));
  return (
    <Static deps={[W, D, floors, premium, shell, grounds, paint]}>
      <B s={[W + 0.4, P, D + 0.4]} p={[0, P / 2, 0]} m={conc} />
      {levels.map((y0, lv) => (
        <group key={lv}>
          {lv > 0 && <B s={[W + 0.9, 0.18, D + 0.9]} p={[0, y0 - 0.09, 0]} m={conc} />}
          <group position={[-hw, 0, hd - 0.115]}><Wall len={W} h={F - 0.18} y0={y0} m={wallM} holes={frontHoles(lv)} /></group>
          <group position={[-hw, 0, -hd + 0.115]}><Wall len={W} h={F - 0.18} y0={y0} m={wallM} holes={spread(W, 2, 1.6)} /></group>
          {[-1, 1].map((sx) => (
            <group key={sx} position={[sx * (hw - 0.115), 0, sx > 0 ? hd : -hd]} rotation={[0, sx > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <Wall len={D} h={F - 0.18} y0={y0} m={wallM} holes={spread(D, nSide, 1.4)} />
            </group>
          ))}
          {/* balcony on every upper floor */}
          {lv > 0 && (
            <group>
              <B s={[W * 0.58, 0.16, 1.5]} p={[0, y0 - 0.08, hd + 0.75]} m={conc} />
              {!shell && (premium
                ? <><B s={[W * 0.58, 1.0, 0.04]} p={[0, y0 + 0.5, hd + 1.48]} m={mat('glass')} cast={false} /><B s={[W * 0.58 + 0.1, 0.06, 0.08]} p={[0, y0 + 1.02, hd + 1.48]} m={mat('gold')} /></>
                : Array.from({ length: Math.round(W * 0.58 / 0.3) + 1 }, (_, i) => <B key={i} s={[0.03, 1.0, 0.03]} p={[-W * 0.29 + i * 0.3, y0 + 0.5, hd + 1.48]} m={mat('metal', { color: '#30343c' })} />))}
              {!shell && !premium && <B s={[W * 0.58 + 0.1, 0.05, 0.06]} p={[0, y0 + 1.02, hd + 1.48]} m={mat('metal', { color: '#30343c' })} />}
            </group>
          )}
        </group>
      ))}
      <B s={[W + 0.9, 0.18, D + 0.9]} p={[0, roof - 0.09, 0]} m={conc} />
      {!shell && (
        <group>
          {/* parapet */}
          <B s={[W + 0.9, 1.0, 0.2]} p={[0, roof + 0.5, hd + 0.35]} m={plaster} />
          <B s={[W + 0.9, 1.0, 0.2]} p={[0, roof + 0.5, -hd - 0.35]} m={plaster} />
          <B s={[0.2, 1.0, D + 0.9]} p={[hw + 0.35, roof + 0.5, 0]} m={plaster} />
          <B s={[0.2, 1.0, D + 0.9]} p={[-hw - 0.35, roof + 0.5, 0]} m={plaster} />
          {/* stair room and tank */}
          <B s={[3.2, 2.6, 3.6]} p={[-hw + 2, roof + 1.3, -hd + 2.2]} m={plaster} />
          <Cyl r={0.7} h={1.3} p={[-hw + 2, roof + 3.25, -hd + 2.2]} m={mat('plain', { color: '#2b2f36', roughness: 0.6 })} seg={20} />
          {/* porch light */}
          <B s={[0.25, 0.25, 0.1]} p={[-hw + W * 0.12 - 0.3, 2.7, hd + 0.05]} m={lampGlow} cast={false} />
          {premium && (
            <group>
              <B s={[1.0, roof - P, 0.3]} p={[-hw + 0.5, P + (roof - P) / 2, hd + 0.05]} m={stoneClad} />
              <B s={[W * 0.45, 0.5, 0.06]} p={[W * 0.2, P + F - 0.45, hd + 0.47]} m={accent} />
              {/* facade uplights */}
              {[-0.3, 0.05, 0.4].map((f) => <B key={f} s={[0.12, 0.3, 0.08]} p={[W * f, P + 1.6, hd + 0.08]} m={lampGlow} cast={false} />)}
            </group>
          )}
        </group>
      )}
      {grounds && !shell && (
        <group>
          {/* covered car parking */}
          <B s={[4.2, 0.15, 5.5]} p={[-hw - 2.4, 2.8, hd - 2.8]} m={conc} />
          <Cyl r={0.12} h={2.7} p={[-hw - 4.3, 1.35, hd - 0.2]} m={mat('metal')} />
          <Cyl r={0.12} h={2.7} p={[-hw - 4.3, 1.35, hd - 5.4]} m={mat('metal')} />
          <Car p={[-hw - 2.4, 0, hd - 2.6]} color={0} />
          <Hedge p={[W * 0.3, 0, hd + 5.6]} len={W * 0.7} />
          <B s={[W + 9, 0.05, 6]} p={[-1, 0.03, hd + 3]} m={mat('paving', { repeat: [6, 2] })} cast={false} />
          {/* compound wall and gate */}
          <B s={[0.2, 1.4, D + 13]} p={[-hw - 6, 0.7, 0]} m={plaster} />
          <B s={[0.2, 1.4, D + 13]} p={[hw + 3, 0.7, 0]} m={plaster} />
          <B s={[W + 9.2, 1.4, 0.2]} p={[-1.5, 0.7, -hd - 6.5]} m={plaster} />
          <B s={[0.7, 1.4, 0.2]} p={[-hw - 5.65, 0.7, hd + 6.5]} m={plaster} />
          <B s={[W + 2.9, 1.4, 0.2]} p={[1.55, 0.7, hd + 6.5]} m={plaster} />
          <B s={[5.4, 1.5, 0.06]} p={[-hw - 2.6, 0.75, hd + 6.5]} m={mat('metal', { color: '#1f2430' })} />
          <B s={[5.4, 0.06, 0.1]} p={[-hw - 2.6, 1.52, hd + 6.5]} m={mat('gold')} />
        </group>
      )}
    </Static>
  );
}

export { windowGlow };
