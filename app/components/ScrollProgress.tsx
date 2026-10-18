'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const NUM_SEGMENTS = 120;
const TICKS = Array.from({ length: NUM_SEGMENTS });

export default function ScrollProgress() {
  const litTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(litTrackRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          // Absolute maximum scroll distance, recalculated on every refresh
          end: () => ScrollTrigger.maxScroll(window),
          scrub: 0.1,
          // Calculate after all pinned sections
          refreshPriority: -1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__rail">
        {/* Unlit, semi-transparent ticks */}
        <div className="scroll-progress__track">
          {TICKS.map((_, i) => (
            <span key={`unlit-${i}`} className="scroll-progress__tick" />
          ))}
        </div>

        {/* Lit ticks, revealed top to bottom as you scroll */}
        <div
          ref={litTrackRef}
          className="scroll-progress__track scroll-progress__track--lit"
          style={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        >
          {TICKS.map((_, i) => (
            <span key={`lit-${i}`} className="scroll-progress__tick" />
          ))}
        </div>
      </div>
    </div>
  );
}