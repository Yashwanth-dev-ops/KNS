// After `next build` (static export): make every /_next/ path relative, so the site runs from any folder.
import fs from 'node:fs'; import path from 'node:path';
const out = 'out'; let n = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) return walk(p);
  if (!/\.(html|js|css|txt)$/.test(e.name)) return;
  let s = fs.readFileSync(p, 'utf8'); const before = s;
  const depth = path.relative(out, path.dirname(p)).split(path.sep).filter(Boolean).length;
  const up = e.name.endsWith('.html') || e.name.endsWith('.txt') ? './'.concat('../'.repeat(depth)) : null;
  if (up) s = s.replace(/(["'(])\/_next\//g, `$1${up}_next/`);
  // webpack's public path inside the runtime chunk
  if (/webpack-.*\.js$/.test(e.name)) s = s.replace(/\.p="\/_next\/"/g, '.p=document.baseURI.replace(/[^/]*$/,"")+"_next/"');
  if (s !== before) { fs.writeFileSync(p, s); n++; }
});
walk(out); console.log(`relativized ${n} files`);

// Some static hosts reserve names that start with "_": move _next/ to assets/ and point every reference there.
const from = path.join(out, '_next'), to = path.join(out, 'assets');
if (fs.existsSync(from)) {
  fs.rmSync(to, { recursive: true, force: true }); fs.renameSync(from, to);
  let m = 0;
  const fix = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return fix(p);
    if (!/\.(html|js|css|txt)$/.test(e.name)) return;
    const s = fs.readFileSync(p, 'utf8'); const t = s.replace(/_next\//g, 'assets/');
    if (t !== s) { fs.writeFileSync(p, t); m++; }
  });
  fix(out); console.log(`moved _next to assets, ${m} files updated`);
}
