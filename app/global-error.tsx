'use client';
// Last-resort screen if the whole app fails to start. Plain styles, because the stylesheet may be what failed.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0e19', color: '#f7f5f0', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif' }}>KNS Construction and Real Estate</h1>
          <p>The site could not start. Please try again.</p>
          <p><button type="button" onClick={reset} style={{ minHeight: 48, padding: '0 22px', borderRadius: 6, border: 0, background: '#a58747', color: '#0b0e19', fontWeight: 600 }}>Try again</button></p>
          <p><a style={{ color: '#e3cf9a' }} href="https://wa.me/919100425645">WhatsApp KNS</a> or call <a style={{ color: '#e3cf9a' }} href="tel:+919100425645">+91 91004 25645</a></p>
        </div>
      </body>
    </html>
  );
}
