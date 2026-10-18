'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Every giant headline line. They never wrap; if one is wider than its box it is scaled down to fit. */
const SELECTOR = [
  '.hero-line',
  '.mh-line',
  '.mf-line',
  '.record-line',
  '.roster-line',
  '.join-line',
  '.ordi-line',
  '.og-line',
  '.craft-name-inner',
].join(',');

export default function FitLines() {
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    const fit = () => {
      raf = 0;
      const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
      els.forEach(el => (el.style.fontSize = ''));
      els.forEach(el => {
        const box = el.parentElement;
        if (!box) return;
        const avail = box.clientWidth;
        const need = el.scrollWidth;
        if (avail > 0 && need > avail) {
          const size = parseFloat(getComputedStyle(el).fontSize);
          el.style.fontSize = `${Math.floor(size * (avail / need) * 0.97 * 10) / 10}px`;
        }
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(fit);
    };
    const timers = [60, 400, 1200, 2600].map(t => window.setTimeout(schedule, t));
    document.fonts?.ready.then(schedule);
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
