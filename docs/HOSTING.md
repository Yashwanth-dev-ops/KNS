# Hosting, error pages and speed

## Error pages included
| Code | File | When a visitor sees it |
|---|---|---|
| 404 | `404.html` | A page or link that does not exist (served automatically by Netlify, Vercel, GitHub Pages) |
| 400, 401, 403, 408, 429 | `errors/<code>.html` | Bad link, login needed, forbidden, timeout, too many requests |
| 500, 502, 503, 504 | `errors/<code>.html` | Server or hosting problem, maintenance, gateway timeout |
| Offline | `offline.html` | No internet and the page was never saved on this phone |
| App crash | built in (`app/error.tsx`, `app/global-error.tsx`) | Something on the page fails: Try again, WhatsApp, Call |
| 3D cannot start | built in | Phone without 3D graphics, or the 3D view crashes: switches to the page version with a notice |

Every error page is self-contained (no scripts, inline styles) and offers the home page, WhatsApp and a phone call.

## Wiring the codes on each host
- **Netlify / Vercel / GitHub Pages:** 404 works automatically. `netlify.toml` and `vercel.json` are included. These hosts do not let a static site replace their own 5xx pages.
- **Apache or cPanel (most Indian shared hosting):** `.htaccess` is included and maps every code.
- **Nginx:**
```
error_page 400 /errors/400.html; error_page 401 /errors/401.html; error_page 403 /errors/403.html;
error_page 404 /404.html;        error_page 408 /errors/408.html; error_page 429 /errors/429.html;
error_page 500 /errors/500.html; error_page 502 /errors/502.html; error_page 503 /errors/503.html; error_page 504 /errors/504.html;
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location = /sw.js { add_header Cache-Control "no-cache"; }
```

## Offline
`sw.js` saves pages and files as they are visited. With no connection, saved pages open as normal; anything else shows `offline.html`. A banner tells the visitor they are offline. It only switches on over https, on the real domain.

## Speed on slow devices
- The site checks the device's graphics on load. **Software rendering** (no graphics chip, e.g. SwiftShader, llvmpipe, Microsoft Basic Render), no WebGL2, 2 GB memory or less, or Data Saver → **Fastest** mode. Phones and 4-core devices → **Balanced**. Everything else → **Best**.
- **Fastest:** no shadows, no post-effects, lower resolution, fewer stars and lights, crane stops swinging.
- **Balanced:** smaller shadows, light glow only.
- A performance monitor watches the frame rate and steps down a level by itself if the device struggles.
- The visitor can change it any time: View → Picture quality.
