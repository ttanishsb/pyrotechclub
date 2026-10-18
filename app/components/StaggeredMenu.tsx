'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type StaggeredMenuItem = { label: string; ariaLabel: string; link: string };
export type StaggeredMenuSocialItem = {
  label: string;
  /** Opens this URL. Omit it (and pass `copy`) for handles that have no URL, like Discord. */
  link?: string;
  /** Text shown next to the logo. */
  handle?: string;
  /** If set, clicking copies this text to the clipboard instead of navigating. */
  copy?: string;
  icon?: ReactNode;
  ariaLabel?: string;
};

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  /** Custom logo node. Falls back to <img src={logoUrl}>. */
  logo?: ReactNode;
  logoUrl?: string;
  /** Optional node centred in the header (hidden on small screens via CSS). */
  center?: ReactNode;
  /** Small line printed at the bottom of the panel. */
  note?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  /** 'light' = the header currently sits over a light section, so it uses dark chrome. */
  tone?: 'dark' | 'light';
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

const MENU_LABEL = 'Menu';
const CLOSE_LABEL = 'Close';

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#B497CF', '#5227FF'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logo,
  logoUrl = '/src/assets/logos/reactbits-gh-white.svg',
  center,
  note,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#5227FF',
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  tone = 'dark',
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const textWrapRef = useRef<HTMLSpanElement | null>(null);
  const [textLines, setTextLines] = useState<string[]>([MENU_LABEL, CLOSE_LABEL]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  const textCycleAnimRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  // Initial positions. Deliberately keyed on `position` only: changing the button colour
  // (which happens on scroll, as the header crosses light/dark sections) must never reset
  // the panel back off-screen. Colour changes are handled by their own effect below.
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll<HTMLElement>('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    // Start from wherever the layers currently are, so re-opening mid-close never snaps.
    const current = (el: Element) => Number(gsap.getProperty(el, 'xPercent')) || 0;
    const layerStates = layers.map(el => ({ el, start: current(el) }));
    const panelStart = current(panel);

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 6 });
    if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 24, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    // Slow, weighty reveal: coloured layers sweep in first, the panel follows.
    const layerGap = 0.1;
    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 1.05, ease: 'expo.out' }, i * layerGap);
    });
    const lastTime = layerStates.length ? (layerStates.length - 1) * layerGap : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.1 : 0);
    const panelDuration = 1.3;
    tl.fromTo(panel, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'expo.out' }, panelInsertTime);

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.2;
      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1.5, ease: 'expo.out', stagger: { each: 0.12, from: 'start' } },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.9, ease: 'power2.out', '--sm-num-opacity': 1, stagger: { each: 0.1, from: 'start' } },
          itemsStart + 0.25
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.5;
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.8, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            stagger: { each: 0.1, from: 'start' },
            // Hand opacity back to CSS so the sibling-dimming hover effect works.
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            },
          },
          socialsStart + 0.05
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    const tl = buildOpenTimeline();
    if (tl) tl.play(0);
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.9,
      ease: 'expo.inOut',
      // Panel leaves first, the coloured layers trail it.
      stagger: { each: 0.06, from: 'end' },
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 6 });
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 });
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 24, opacity: 0 });
      },
    });
  }, [position]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    spinTweenRef.current = opening
      ? gsap.to(icon, { rotate: 225, duration: 1.1, ease: 'expo.out', overwrite: 'auto' })
      : gsap.to(icon, { rotate: 0, duration: 0.7, ease: 'expo.inOut', overwrite: 'auto' });
  }, []);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        // Time the swap to when the (light) panel actually reaches the button.
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: opening ? 0.5 : 0.25,
          duration: 0.5,
          ease: 'power2.out',
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  // Follow the colour props (the header changes tone as it crosses light/dark sections).
  useEffect(() => {
    const btn = toggleBtnRef.current;
    if (!btn) return;
    const target = changeMenuColorOnOpen && openRef.current ? openMenuButtonColor : menuButtonColor;
    gsap.to(btn, { color: target, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening: boolean) => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? MENU_LABEL : CLOSE_LABEL;
    const targetLabel = opening ? CLOSE_LABEL : MENU_LABEL;
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === MENU_LABEL ? CLOSE_LABEL : MENU_LABEL;
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.7 + lineCount * 0.08,
      ease: 'expo.out',
    });
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickAway, open, closeMenu]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeMenu]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    },
    []
  );

  const copyHandle = useCallback(async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* Clipboard can be blocked (insecure origin). The handle is still printed in the row. */
    }
    setCopiedKey(key);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedKey(null), 2200);
  }, []);

  const layerColors = (() => {
    const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
    const arr = [...raw];
    if (arr.length >= 3) {
      const mid = Math.floor(arr.length / 2);
      arr.splice(mid, 1);
    }
    return arr;
  })();

  return (
    <div
      className={(className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : '')}
      style={accentColor ? ({ ['--sm-accent']: accentColor } as CSSProperties) : undefined}
      data-position={position}
      data-tone={tone}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {layerColors.map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <header className="staggered-menu-header" aria-label="Main navigation header">
        <div className="sm-logo" aria-label="Logo">
          {logo ?? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="sm-logo-img" draggable={false} width={110} height={24} />
          )}
        </div>
        {center ? <div className="sm-center">{center}</div> : null}
        <button
          ref={toggleBtnRef}
          className="sm-toggle cursor-target"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          data-cursor-label={open ? 'Close' : 'Menu'}
          onClick={toggleMenu}
          type="button"
        >
          <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => (
                <span className="sm-toggle-line" key={i}>
                  {l}
                </span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
        // Keep Lenis out of the panel so it can scroll on short screens.
        data-lenis-prevent=""
      >
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items && items.length ? (
              items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <a
                    className="sm-panel-item cursor-target"
                    href={it.link}
                    aria-label={it.ariaLabel}
                    data-index={idx + 1}
                    data-cursor-label={it.label}
                    tabIndex={open ? 0 : -1}
                    onClick={() => closeMenu()}
                  >
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </a>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Find us</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => {
                  const key = s.label + i;
                  const copied = copiedKey === key;
                  const body = (
                    <>
                      <span className="sm-social-icon">{s.icon}</span>
                      <span className="sm-social-text">
                        <span className="sm-social-name">{s.label}</span>
                        <span className="sm-social-handle">{s.handle ?? s.link}</span>
                      </span>
                      <span className="sm-social-action" aria-live="polite">
                        {copied ? 'Copied' : s.copy ? 'Copy' : ''}
                      </span>
                    </>
                  );
                  return (
                    <li key={key} className="sm-socials-item">
                      {s.copy ? (
                        <button
                          type="button"
                          className="sm-socials-link cursor-target"
                          aria-label={s.ariaLabel ?? `Copy ${s.label} username ${s.copy}`}
                          data-cursor-label="Copy"
                          tabIndex={open ? 0 : -1}
                          onClick={() => copyHandle(key, s.copy as string)}
                        >
                          {body}
                        </button>
                      ) : (
                        <a
                          className="sm-socials-link cursor-target"
                          href={s.link}
                          target={s.link?.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          aria-label={s.ariaLabel ?? `${s.label}: ${s.handle ?? s.link}`}
                          data-cursor-label={s.label}
                          tabIndex={open ? 0 : -1}
                        >
                          {body}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {note ? <p className="sm-note">{note}</p> : null}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
