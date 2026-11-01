'use client';
import { useEffect, useState } from 'react';

// Registers offline support (on real hosting only), and tells the visitor when the connection drops goes offline.
export function Resilience() {
  const [online, setOnline] = useState(true);
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
        <p className="pointer-events-auto rounded-lg bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg">
          You are offline. What you have already opened still works; WhatsApp and calls need a connection.
        </p>
      )}
    </div>
  );
}
