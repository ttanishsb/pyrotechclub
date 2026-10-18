'use client';

import dynamic from 'next/dynamic';
import { Fragment, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ModelScene, { type ScrollMotion } from './ModelScene';
import Portrait from './Portrait';
import JoinSection from './JoinSection';
import { coreTeam, members, pad } from '../data/members';
import { onSiteReady } from '../lib/ready';
import Mark from './Mark';
import { ORDI_SEGMENTS } from '../data/ordinatrix';

gsap.registerPlugin(ScrollTrigger);

const ASCIIText = dynamic(() => import('./ASCIIText'), { ssr: false });

const INTRO_WORDS =
  "We don't wait for the future to arrive. We open the tools, test the limits, break what doesn't work, and build something better.".split(
    ' '
  );

const BAND_WORDS = ['Web design', 'Software', 'Image editing', 'Filmmaking', '3D modelling'];

const CRAFT = [
  { name: 'Web design', tag: 'Design / Frontend', line: 'Interfaces with intent. Layout, motion and craft in every pixel.' },
  { name: 'Software', tag: 'Code / Systems', line: 'Code that ships. From the first commit to something people actually use.' },
  { name: 'Image editing', tag: 'Photo / Retouch', line: 'Frames pushed past what the camera saw.' },
  { name: 'Filmmaking', tag: 'Film / Edit', line: 'Story, light and cut. Films that make a room go quiet.' },
  { name: '3D modelling', tag: 'Model / Render', line: 'Form built from nothing. Objects that never existed, rendered like they did.' },
];

const STEPS = [
  { name: 'Ideas', line: 'Start with the question nobody else is asking.' },
  { name: 'Experiments', line: 'Break it. Rebuild it. Learn what it was really made of.' },
  { name: 'Real things', line: 'Ship it. Put it out into the world.' },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function SectionHead({ n, name }: { n: string; name: string }) {
  return (
    <div className="section-head">
      <span className="section-num">{n}</span>
      <span className="section-name">{name}</span>
    </div>
  );
}

/** The interactive ASCII wordmark. Sized from its own box so the word always fits. */
function PlayStage() {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ text: 'PYROTECH', scale: 0.8 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight || 1;
      const aspect = w / h;
      const small = w < 640;
      // Plane math: 8 glyphs fills ~88% of the width at scale = 0.44 * aspect; 4 glyphs at 0.84 * aspect.
      setFit({ text: small ? 'PYRO' : 'PYROTECH', scale: clamp(small ? 0.84 * aspect : 0.44 * aspect, 0.3, 1.4) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="play-stage" ref={ref}>
      <ASCIIText
        text={fit.text}
        asciiFontSize={8}
        fontWeight={700}
        textColor="#fdf9f3"
        colors={['#168BFF', '#6FB8FF', '#FFFFFF']}
        textScale={fit.scale}
        blocks={0.14}
        waves={0.8}
        waveSpeed={0.55}
        chroma={0.6}
        tilt={0.9}
        hueShift={0.2}
        scramble={0.5}
        clickRipple
        intro
        idle
        interactive
      />
    </div>
  );
}

export default function PyrotechLanding() {
  const rootRef = useRef<HTMLElement>(null);
  const motion = useRef<ScrollMotion>({ progress: 0, velocity: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const decay = () => {
      motion.current.velocity *= 0.92;
    };
    gsap.ticker.add(decay);

    let marqueeTick: (() => void) | null = null;

    const ctx = gsap.context(() => {
      /* ---- scroll position -> 3D model ---- */
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => {
          motion.current.progress = self.progress;
          motion.current.velocity = self.getVelocity();
        },
      });

      /* ---- hero: start hidden, entrance is played when the curtain lifts ---- */
      gsap.set('.hero-line', { yPercent: 112 });
      gsap.set('.hero-meta > *, .hero-foot > *', { opacity: 0, y: 18 });

      gsap.to('.hero-title', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 },
      });
      gsap.to('.hero-foot', {
        opacity: 0,
        y: -30,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: '55% top', end: 'bottom top', scrub: 1.2 },
      });

      /* ---- generic: masked line reveals (triggered, slow expo) ---- */
      gsap.utils.toArray<HTMLElement>('.reveal-block').forEach(block => {
        const lines = block.querySelectorAll('.reveal-line');
        gsap.set(lines, { yPercent: 112 });
        ScrollTrigger.create({
          trigger: block,
          start: 'top 84%',
          once: true,
          onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.7, stagger: 0.15, ease: 'expo.out' }),
        });
      });

      gsap.utils.toArray<HTMLElement>('.reveal-fade').forEach(block => {
        gsap.set(block, { opacity: 0, y: 28 });
        ScrollTrigger.create({
          trigger: block,
          start: 'top 90%',
          once: true,
          onEnter: () => gsap.to(block, { opacity: 1, y: 0, duration: 1.5, ease: 'expo.out' }),
        });
      });

      /* ---- manifesto: words light up as you read ---- */
      gsap.fromTo(
        '.intro-copy .reveal-word',
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: '.intro-copy', start: 'top 84%', end: 'bottom 48%', scrub: 1.2 },
        }
      );

      gsap.fromTo(
        '.step',
        { opacity: 0.22 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.5,
          scrollTrigger: { trigger: '.steps', start: 'top 82%', end: 'bottom 55%', scrub: 1.2 },
        }
      );
      gsap.fromTo(
        '.step-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          stagger: 0.5,
          transformOrigin: 'left center',
          scrollTrigger: { trigger: '.steps', start: 'top 82%', end: 'bottom 55%', scrub: 1.2 },
        }
      );

      /* ---- craft rows: hairlines draw in ---- */
      gsap.utils.toArray<HTMLElement>('.craft-row').forEach(row => {
        const rule = row.querySelector('.craft-rule');
        const rest = row.querySelectorAll('.craft-meta, .craft-line');
        gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(rest, { opacity: 0, y: 16 });
        ScrollTrigger.create({
          trigger: row,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(rule, { scaleX: 1, duration: 2, ease: 'expo.out' });
            gsap.to(rest, { opacity: 1, y: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out', delay: 0.2 });
          },
        });
      });

      /* ---- band: slow drift that surges with scroll velocity ---- */
      const track = root.querySelector<HTMLElement>('.band-track');
      if (track) {
        const drift = gsap.to(track, { xPercent: -50, ease: 'none', duration: 64, repeat: -1 });
        let dir = 1;
        let boost = 0;
        let eased = 1;
        ScrollTrigger.create({
          onUpdate: self => {
            dir = self.direction === 0 ? dir : self.direction;
            boost = Math.min(Math.abs(self.getVelocity()) / 240, 7);
          },
        });
        marqueeTick = () => {
          boost *= 0.94;
          const target = dir * (1 + boost);
          eased += (target - eased) * 0.06;
          drift.timeScale(eased);
        };
        gsap.ticker.add(marqueeTick);
      }

      /* ---- Ordin@trix teaser: marquee runs the opposite way to the first band ---- */
      const ordiTrack = root.querySelector<HTMLElement>('.ordi-track');
      if (ordiTrack) {
        gsap.fromTo(ordiTrack, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 52, repeat: -1 });
      }

      /* ---- play: the stage opens like a window ---- */
      gsap.fromTo(
        '.play-stage',
        { clipPath: 'inset(16% 12% 16% 12%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: '.play', start: 'top 78%', end: 'top 10%', scrub: 1.2 },
        }
      );

      /* ---- record: arena rows ---- */
      gsap.utils.toArray<HTMLElement>('.arena').forEach(row => {
        gsap.set(row, { opacity: 0, y: 24 });
        ScrollTrigger.create({
          trigger: row,
          start: 'top 92%',
          once: true,
          onEnter: () => gsap.to(row, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out' }),
        });
      });

      /* ---- roster: columns drift at different speeds ---- */
      const speeds = [-70, -170, -110];
      gsap.utils.toArray<HTMLElement>('.roster-col').forEach((col, i) => {
        gsap.fromTo(
          col,
          { y: 0 },
          {
            y: speeds[i % speeds.length],
            ease: 'none',
            scrollTrigger: { trigger: '.roster', start: 'top bottom', end: 'bottom top', scrub: 1.4 },
          }
        );
      });
    }, root);

    /* ---- hero entrance: plays as the curtain lifts ---- */
    const offReady = onSiteReady(() => {
      ctx.add(() => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to('.hero-meta > *', { opacity: 1, y: 0, duration: 1.5, stagger: 0.15 }, 0.1)
          .to('.hero-line', { yPercent: 0, duration: 2, stagger: 0.18 }, 0.15)
          .to('.hero-foot > *', { opacity: 1, y: 0, duration: 1.5, stagger: 0.14 }, 1.1);
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      offReady();
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(decay);
      if (marqueeTick) gsap.ticker.remove(marqueeTick);
      ctx.revert();
    };
  }, []);

  const rosterPool = [...coreTeam, ...members];
  const rosterCols = [
    [0, 3],
    [1, 4],
    [2, 5],
  ];

  return (
    <main ref={rootRef} className="site-shell">
      <ModelScene motion={motion} />

      {/* ───────── Hero ───────── */}
      <section id="top" className="hero" data-tone="dark">
        <div className="hero-meta">
          <span><i className="live" />Student technology collective</span>
          <span>Delhi, India — est. 2004</span>
        </div>

        <h1 className="hero-title" aria-label="We make things happen">
          <span className="mask hero-row">
            <span className="hero-line hero-line--a">We make</span>
          </span>
          <span className="mask hero-row">
            <span className="hero-line hero-line--b" data-text="things">things</span>
          </span>
          <span className="mask hero-row">
            <span className="hero-line hero-line--c">
              happen<em>.</em>
            </span>
          </span>
        </h1>

        <div className="hero-foot">
          <p className="hero-lede">
            A select team of student builders, makers and technology enthusiasts at Tagore International School, Vasant
            Vihar.
          </p>
          <a className="hero-cue cursor-target" href="#manifesto" data-cursor-label="Scroll">
            <span>Scroll</span>
            <i />
          </a>
          <a className="cta-link cursor-target" href="/members" data-cursor-label="Members">
            <span>Meet the members</span>
          </a>
        </div>
      </section>

      {/* ───────── Band ───────── */}
      <section className="band" data-tone="light" aria-label="Our disciplines">
        <div className="band-track">
          {[0, 1].map(g => (
            <div className="band-group" key={g} aria-hidden={g === 1}>
              {BAND_WORDS.map((w, i) => (
                <Fragment key={w}>
                  <span className={'band-word' + (i % 2 ? ' band-word--outline' : '')}>{w}</span>
                  <Mark />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 01 Mindset ───────── */}
      <section id="manifesto" className="manifesto" data-tone="dark">
        <SectionHead n="01" name="Mindset" />
        <div className="mf-grid">
          <p className="intro-copy">
            {INTRO_WORDS.map((w, i) => (
              <span className="reveal-word" key={i}>
                {w}{' '}
              </span>
            ))}
          </p>
          <h2 className="mf-title reveal-block" aria-label="Not just using tech. Making it.">
            <span className="mask">
              <span className="reveal-line mf-line mf-line--ghost">Not just using</span>
            </span>
            <span className="mask">
              <span className="reveal-line mf-line mf-line--ghost">tech.</span>
            </span>
            <span className="mask">
              <span className="reveal-line mf-line mf-line--solid">
                Making it<b>.</b>
              </span>
            </span>
          </h2>
        </div>

        <ol className="steps">
          {STEPS.map(s => (
            <li className="step" key={s.name}>
              <i className="step-line" />
              <h3>{s.name}</h3>
              <p>{s.line}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── 02 Craft ───────── */}
      <section id="craft" className="craft" data-tone="dark">
        <SectionHead n="02" name="Craft" />
        <h2 className="craft-head">Five things we're stupidly good at.</h2>
        <div className="craft-list">
          {CRAFT.map((c, i) => (
            <article className="craft-row cursor-target" key={c.name} data-cursor-label={c.name}>
              <div className="craft-rule" />
              <div className="craft-meta">
                <span>{pad(i + 1)}</span>
                <span>{c.tag}</span>
              </div>
              <h3 className="craft-name reveal-block mask">
                <span className="reveal-line craft-name-inner">{c.name}</span>
              </h3>
              <p className="craft-line">{c.line}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── 03 Ordin@trix (teaser) ───────── */}
      <section id="ordinatrix" className="ordi ordi--teaser" data-tone="dark" data-model="off">
        <SectionHead n="03" name="Our festival" />

        <div className="ordi-top">
          <h2 className="ordi-title reveal-block" aria-label="Ordin@trix">
            <span className="mask">
              <span className="reveal-line ordi-line ordi-line--a">Ordin</span>
            </span>
            <span className="mask">
              <span className="reveal-line ordi-line ordi-line--b">@trix</span>
            </span>
          </h2>
          <div className="ordi-bio reveal-fade">
            <p className="ordi-kicker">Annual inter-school computer festival. Since 2004.</p>
            <p>
              Our flagship event. Students from classes III to XII compete in coding, film, robotics, design and more,
              and schools from China, Japan and Oman now take part.
            </p>
            <a className="cta cta--paper cursor-target" href="/ordinatrix" data-cursor-label="Know more">
              <span>Know more</span>
            </a>
          </div>
        </div>

        <div className="ordi-marquee" aria-label="Competition segments">
          <div className="ordi-track">
            {[0, 1].map(g => (
              <div className="ordi-group" key={g} aria-hidden={g === 1}>
                {ORDI_SEGMENTS.map((w, i) => (
                  <Fragment key={w.name}>
                    <span className={'ordi-word' + (i % 2 ? ' ordi-word--solid' : '')}>{w.name}</span>
                    <Mark />
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 04 Play ───────── */}
      <section id="play" className="play" data-tone="dark" data-model="off">
        <SectionHead n="04" name="Play" />
        <div className="play-copy">
          <h2>Go on, poke it.</h2>
          <p>Move across the letters. Click to send a ripple through them.</p>
        </div>
        <PlayStage />
      </section>

      {/* ───────── 04 Record ───────── */}
      <section id="record" className="record" data-tone="light" data-model="off">
        <SectionHead n="05" name="Record" />
        <div className="record-grid">
          <h2 className="record-title reveal-block" aria-label="We show up. We compete. We deliver.">
            <span className="mask">
              <span className="reveal-line record-line record-line--a">We show up.</span>
            </span>
            <span className="mask">
              <span className="reveal-line record-line record-line--b">We compete.</span>
            </span>
            <span className="mask">
              <span className="reveal-line record-line record-line--a">We deliver.</span>
            </span>
          </h2>
          <div className="record-copy reveal-fade">
            <p>Our work leaves the lab. Competitions, events, real briefs.</p>
            <p>Five disciplines, judged by people who won&apos;t go easy on us.</p>
          </div>
        </div>
        <ul className="arenas" role="list">
          {BAND_WORDS.map((w, i) => (
            <li className="arena cursor-target" key={w} data-cursor-label={w}>
              <span className="arena-no">{pad(i + 1)}</span>
              <b>{w}</b>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── 05 Roster ───────── */}
      <section id="roster" className="roster" data-tone="dark">
        <SectionHead n="06" name="Roster" />
        <div className="roster-grid">
          <div className="roster-copy">
            <h2 className="roster-title reveal-block" aria-label="The people behind the builds.">
              <span className="mask">
                <span className="reveal-line roster-line">The people</span>
              </span>
              <span className="mask">
                <span className="reveal-line roster-line">behind the</span>
              </span>
              <span className="mask">
                <span className="reveal-line roster-line roster-line--outline">builds.</span>
              </span>
            </h2>
            <p className="reveal-fade">Real people, real builds. Say hi.</p>
            <a className="cta cta--paper cursor-target reveal-fade" href="/members" data-cursor-label="Members">
              <span>Meet the members</span>
            </a>
          </div>
          <div className="roster-cols" aria-hidden="true">
            {rosterCols.map((col, ci) => (
              <div className="roster-col" key={ci}>
                {col.map(idx => (
                  <Portrait key={idx} member={rosterPool[idx % rosterPool.length]} index={idx + 1} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 06 Join ───────── */}
      <JoinSection index="07" name="Join" lineA="Build what" lineB="comes next." />
    </main>
  );
}
