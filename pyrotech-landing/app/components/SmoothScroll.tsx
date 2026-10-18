'use client';

import { createContext, useContext, useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

type LenisRef = MutableRefObject<Lenis | null>;
const LenisContext = createContext<LenisRef>({ current: null });

/** Access the shared Lenis instance (null until mounted, or with reduced motion). */
export const useLenisRef = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Low lerp + damped wheel = the long, silky glide of a premium site.
    const lenis = new Lenis({
      lerp: 0.072,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
