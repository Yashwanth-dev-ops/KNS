'use client';
import { useEffect, useState } from 'react';
import { useWorld } from '../lib/store';

// Registers offline support (on real hosting only), and tells the visitor when the connection drops or the 3D view stopped.
export function Resilience() {
  const [online, setOnline] = useState(true);
  const notice = useWorld((s) => s.notice), setNotice = useWorld((s) => s.setNotice);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    const framed = (() => { try { return window.top !== window.self; } catch { return true; } })();
    if ('serviceWorker' in navigator && location.protocol === 'https:' && !framed) navigator.serviceWorker.register('sw.js').catch(() => {});
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-3" aria-live="polite">
      {!online && (
        <p className="pointer-events-auto rounded-lg bg-gold-500 px-4 py-2 text-center text-sm font-semibold text-navy-950 shadow-lg">
          You are offline. What you have already opened still works; WhatsApp and calls need a connection.
        </p>
      )}
      {notice && (
        <p className="pointer-events-auto flex items-center gap-3 rounded-lg bg-stone-50 px-4 py-2 text-sm text-navy-900 shadow-lg">
          {notice}
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="grid h-8 w-8 place-items-center rounded text-lg text-navy-900/60 hover:bg-navy-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500">×</button>
        </p>
      )}
    </div>
  );
}
