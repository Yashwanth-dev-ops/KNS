'use client';
// Picks a starting quality from what the device can do. Software rendering (SwiftShader, llvmpipe,
// Microsoft Basic Render), very little memory or no WebGL2 starts on "minimal"; phones on "lite".
export type Quality = 'high' | 'lite' | 'minimal';

export function rendererName(): string {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return '';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return name;
  } catch { return ''; }
}

export function isSoftware(name = rendererName()) {
  return /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(name);
}

export function detectQuality(): Quality {
  const name = rendererName();
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const webgl2 = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
  if (isSoftware(name) || !webgl2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData) return 'minimal';
  if (matchMedia('(max-width: 768px)').matches || (navigator.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4) return 'lite';
  return 'high';
}

export const downFrom = (q: Quality): Quality => (q === 'high' ? 'lite' : 'minimal');
