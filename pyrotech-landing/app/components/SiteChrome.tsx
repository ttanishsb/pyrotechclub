'use client';

import ScrollProgress from './ScrollProgress';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StaggeredMenu, { type StaggeredMenuItem, type StaggeredMenuSocialItem } from './StaggeredMenu';
import TargetCursor from './TargetCursor';
import { useProgress } from '@react-three/drei';
import { DiscordIcon, GmailIcon, InstagramIcon } from './SocialIcons';
import FitLines from './FitLines';
import { useLenisRef } from './SmoothScroll';
import { easeOutExpo, setSiteReady } from '../lib/ready';

gsap.registerPlugin(ScrollTrigger);

// WebGPU/WebGL code only ever runs in the browser.
const ShapeWaves = dynamic(() => import('./ShapeWaves'), { ssr: false });

const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: 'Home', ariaLabel: 'Go to the home page', link: '/' },
  { label: 'Domain', ariaLabel: 'See what we build', link: '/#craft' },
  { label: 'Ordin@trix', ariaLabel: 'Our annual festival', link: '/ordinatrix' },
  { label: 'Members', ariaLabel: 'Meet the members', link: '/members' },
  { label: 'Join', ariaLabel: 'Find your way in', link: '/#join' },
];

const SOCIAL_ITEMS: StaggeredMenuSocialItem[] = [
  {
    label: 'Discord',
    handle: 'ppyrotechh',
    copy: 'ppyrotechh', // Discord has no profile URL for a username, so this copies it.
    icon: <DiscordIcon />,
    ariaLabel: 'Copy our Discord username, ppyrotechh',
  },
  {
    label: 'Instagram',
    handle: 'tagoreint_vasantvihar',
    link: 'https://www.instagram.com/tagoreint_vasantvihar/',
    icon: <InstagramIcon />,
  },
  {
    label: 'Gmail',
    handle: 'pyrotech@tagoreint.com',
    link: 'mailto:pyrotech@tagoreint.com',
    icon: <GmailIcon />,
  },
];


const BRAND = 'PYROTECH'.split('');

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SiteChrome({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenisRef = useLenisRef();

  const [tone, setTone] = useState<'dark' | 'light'>('dark');
  const [compact, setCompact] = useState(false);
  const [gpuFailed, setGpuFailed] = useState(false);
  const [introKey, setIntroKey] = useState(0);

  const curtainRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const loadBarRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLElement>(null);
  const busyRef = useRef(false);
  const toneRef = useRef<'dark' | 'light'>('dark');

  /* ---------- helpers ---------- */

  const scrollToHash = useCallback(
    (hash: string, immediate = false) => {
      let el: HTMLElement | null = null;
      if (hash && hash !== '#') {
        try {
          el = document.querySelector<HTMLElement>(hash);
        } catch {
          el = null;
        }
      }
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(el ?? 0, { duration: immediate ? 0 : 2.2, easing: easeOutExpo, immediate });
      } else {
        window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY : 0 });
      }
    },
    [lenisRef]
  );

  const setBrandLabelColors = (ink: HTMLElement, paper: boolean) => {
    gsap.set(ink, { backgroundColor: paper ? '#F2F4F7' : '#000000', color: paper ? '#000000' : '#F2F4F7' });
  };

  /* ---------- curtain: cover (leaving a page) / reveal (arriving) ---------- */

  const cover = useCallback(() => {
    return new Promise<void>(resolve => {
      const curtain = curtainRef.current;
      const blue = blueRef.current;
      const ink = inkRef.current;
      if (!curtain || !blue || !ink) return resolve();
      const letters = ink.querySelectorAll('.curtain-brand i');
      gsap.killTweensOf([blue, ink, letters]);
      gsap.set(curtain, { display: 'block' });
      setBrandLabelColors(ink, true);
      gsap.set([blue, ink], { yPercent: 100 });
      gsap.set(letters, { yPercent: 110, opacity: 1 });
      if (loadBarRef.current) gsap.set(loadBarRef.current, { opacity: 0 });
      const tl = gsap.timeline({ onComplete: resolve });
      tl.to(blue, { yPercent: 0, duration: 1.0, ease: 'expo.inOut' }, 0)
        .to(ink, { yPercent: 0, duration: 1.0, ease: 'expo.inOut' }, 0.12)
        .to(letters, { yPercent: 0, duration: 1.0, stagger: 0.04, ease: 'expo.out' }, 0.7);
    });
  }, []);

  const reveal = useCallback(() => {
    const curtain = curtainRef.current;
    const blue = blueRef.current;
    const ink = inkRef.current;
    if (!curtain || !blue || !ink) {
      busyRef.current = false;
      setSiteReady(true);
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(curtain, { display: 'none' });
        busyRef.current = false;
        ScrollTrigger.refresh();
      },
    });
    tl.addLabel('lift', 0.25)
      .to(ink, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, 'lift')
      .add(() => setSiteReady(true), 'lift+=0.45')
      .to(blue, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, 'lift+=0.14');
  }, []);

  /* ---------- first load: wordmark loader that waits for the 3D model ---------- */

  useEffect(() => {
    const curtain = curtainRef.current;
    const blue = blueRef.current;
    const ink = inkRef.current;
    if (!curtain || !blue || !ink) return;
    const hash = window.location.hash;

    if (prefersReducedMotion()) {
      curtain.style.display = 'none';
      setSiteReady(true);
      if (hash) scrollToHash(hash, true);
      return;
    }

    const letters = ink.querySelectorAll('.curtain-brand i');
    const bar = loadBarRef.current;
    gsap.set(letters, { yPercent: 110, opacity: 1 });
    if (bar) gsap.set(bar, { scaleX: 0, opacity: 1 });

    let alive = true;
    const started = performance.now();
    const MIN_MS = 1700; // always long enough to read the wordmark
    const MAX_MS = 7000; // never trap the visitor if the model is slow

    // Real progress from the 3D model download (drei's loading manager), eased so it never jumps.
    const shown = { v: 0 };
    const tick = () => {
      const st = useProgress.getState();
      const elapsed = performance.now() - started;
      const target = st.total === 0 ? Math.min(1, elapsed / MIN_MS) : Math.min(st.progress / 100, 1);
      const floor = Math.min(elapsed / MIN_MS, 1) * 0.85;
      shown.v += (Math.max(target, floor) - shown.v) * 0.12;
      if (bar) bar.style.transform = `scaleX(${Math.min(shown.v, 1)})`;
    };
    gsap.ticker.add(tick);

    const waitForAssets = () =>
      new Promise<void>(resolve => {
        const check = () => {
          if (!alive) return resolve();
          const st = useProgress.getState();
          const elapsed = performance.now() - started;
          const modelDone = st.total > 0 && !st.active && st.progress >= 100;
          const noModelOnPage = st.total === 0 && elapsed > MIN_MS;
          if ((elapsed > MIN_MS && (modelDone || noModelOnPage)) || elapsed > MAX_MS) return resolve();
          window.setTimeout(check, 90);
        };
        check();
      });

    const tl = gsap.timeline();
    tl.to(letters, { yPercent: 0, duration: 1.2, stagger: 0.055, ease: 'expo.out' }, 0.1);

    void waitForAssets().then(() => {
      if (!alive) return;
      gsap.ticker.remove(tick);
      if (bar) gsap.to(bar, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
      gsap
        .timeline({ delay: 0.35 })
        .add(() => {
          if (hash) scrollToHash(hash, true);
        })
        .to(ink, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 0)
        .add(() => {
          setSiteReady(true);
          setIntroKey(1);
        }, 0.45)
        .to(blue, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 0.14)
        .set(curtain, { display: 'none' }, 1.5);
    });

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      tl.kill();
    };
  }, [scrollToHash]);

  /* ---------- navigation (internal links, anchors, route transitions) ---------- */

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const target = url.pathname + url.search + url.hash;

      if (url.pathname === window.location.pathname) {
        scrollToHash(url.hash);
        window.history.pushState(null, '', target);
        return;
      }
      if (busyRef.current) return;

      if (prefersReducedMotion()) {
        router.push(target);
        return;
      }

      busyRef.current = true;
      setSiteReady(false);
      void cover().then(() => router.push(target));

      // Safety net: if the route never swaps, don't leave the visitor behind a curtain.
      window.setTimeout(() => {
        if (busyRef.current && window.location.pathname !== url.pathname) {
          busyRef.current = false;
          reveal();
        }
      }, 6000);
    },
    [cover, reveal, router, scrollToHash]
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (href.startsWith('#') || href.startsWith('/')) {
        event.preventDefault();
        navigate(href);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  // A new route has mounted: jump to its top (or hash) while still covered, then lift the curtain.
  useEffect(() => {
    if (!busyRef.current) return;
    scrollToHash(window.location.hash, true);
    const id = requestAnimationFrame(() => reveal());
    return () => cancelAnimationFrame(id);
  }, [pathname, reveal, scrollToHash]);

  /* ---------- scroll HUD + tone detection ---------- */

  useEffect(() => {
    const html = document.documentElement;
    let raf = 0;

    const run = () => {
      raf = 0;
      const max = Math.max(1, html.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (meterRef.current) {
        const num = meterRef.current.querySelector('b');
        if (num) num.textContent = String(Math.round(p * 100)).padStart(2, '0');
      }

      const lights = document.querySelectorAll<HTMLElement>('[data-tone="light"]');
      const lightAt = (y: number) => {
        let hit = false;
        lights.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top <= y && r.bottom > y) hit = true;
        });
        return hit;
      };
      const nextTone = lightAt(40) ? 'light' : 'dark';
      if (nextTone !== toneRef.current) {
        toneRef.current = nextTone;
        setTone(nextTone);
      }
      html.dataset.toneBottom = lightAt(window.innerHeight - 36) ? 'light' : 'dark';

      let modelOff = false;
      const mid = window.innerHeight * 0.5;
      document.querySelectorAll<HTMLElement>('[data-model="off"]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) modelOff = true;
      });
      html.dataset.modelOff = String(modelOff);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    const settle = window.setTimeout(schedule, 600);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  /* ---------- responsive background density ---------- */

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  /* ---------- menu <-> smooth scroll ---------- */

  const onMenuOpen = useCallback(() => {
    if (lenisRef.current) lenisRef.current.stop();
    else document.documentElement.style.overflow = 'hidden';
  }, [lenisRef]);

  const onMenuClose = useCallback(() => {
    if (lenisRef.current) lenisRef.current.start();
    else document.documentElement.style.overflow = '';
  }, [lenisRef]);

  return (
    <>
      {/* Persistent WebGPU backdrop: stays mounted across route changes. */}
      <div className="bg-field" aria-hidden="true">
        {gpuFailed ? (
          <div className="bg-fallback" />
        ) : (
          <ShapeWaves
            text=""
            shapes="mixed"
            cellSize={compact ? 13 : 11}
            dotSize={0.72}
            color="#3A4452"
            hoverColor="#8FCBFF"
            backgroundColor="#000000"
            speed={0.5}
            scale={1.4}
            contrast={1}
            brightness={0.4}
            flow={0.5}
            direction={28}
            fade={0.3}
            interactive
            splashRadius={compact ? 46 : 74}
            splashStrength={0.5}
            glow={0.5}
            intro
            introDuration={2.8}
            introKey={introKey}
            onError={() => setGpuFailed(true)}
          />
        )}
      </div>

      <div className="grain" aria-hidden="true" />
      <FitLines />

      {children}

      <ScrollProgress />

      <StaggeredMenu
        isFixed
        position="right"
        items={MENU_ITEMS}
        socialItems={SOCIAL_ITEMS}
        displaySocials
        displayItemNumbering
        colors={['#0B4FD0', '#168BFF']}
        accentColor="#168BFF"
        menuButtonColor={tone === 'light' ? '#000000' : '#F2F4F7'}
        openMenuButtonColor="#000000"
        changeMenuColorOnOpen
        tone={tone}
        note="Tagore International School, Vasant Vihar"
        logo={
          <a className="brand cursor-target" href="/" data-cursor-label="Home" aria-label="PYROTECH home">
            PYROTECH
          </a>
        }
        center={<span className="header-note">Tagore International School</span>}
        onMenuOpen={onMenuOpen}
        onMenuClose={onMenuClose}
      />

      <TargetCursor
        spinDuration={3.2}
        hoverDuration={0.38}
        size={34}
        cornerSize={11}
        thickness={2}
        padding={8}
        dotSize={4}
        parallaxOn
        hideDefaultCursor
      />

      {/* Intro loader + page transition. Server-rendered covering the page so nothing flashes. */}
      <div className="curtain" ref={curtainRef} aria-hidden="true">
        <div className="curtain-layer curtain-blue" ref={blueRef} />
        <div className="curtain-layer curtain-ink" ref={inkRef}>
          <div className="curtain-label">
            <span className="curtain-brand">
              {BRAND.map((c, i) => (
                <span className="curtain-letter" key={i}>
                  <i>{c}</i>
                </span>
              ))}
            </span>
          </div>
          <span className="curtain-bar">
            <span ref={loadBarRef} />
          </span>
        </div>
      </div>
      <noscript>
        <style>{'.curtain{display:none!important}'}</style>
      </noscript>
    </>
  );
}
