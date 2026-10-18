'use client';

import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import JoinSection from './JoinSection';
import Mark from './Mark';
import { ORDI_MILESTONES, ORDI_SEGMENTS, ORDI_STATS } from '../data/ordinatrix';
import { pad } from '../data/members';
import { onSiteReady } from '../lib/ready';

gsap.registerPlugin(ScrollTrigger);

function Head({ n, name }: { n: string; name: string }) {
  return (
    <div className="section-head">
      <span className="section-num">{n}</span>
      <span className="section-name">{name}</span>
    </div>
  );
}

export default function OrdinatrixView() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.set('.og-line', { yPercent: 112 });
      gsap.set('.og-meta > *, .og-foot > *', { opacity: 0, y: 18 });

      gsap.to('.og-title', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.og', start: 'top top', end: 'bottom top', scrub: 1.4 },
      });

      gsap.utils.toArray<HTMLElement>('.reveal-block').forEach(block => {
        const lines = block.querySelectorAll('.reveal-line');
        gsap.set(lines, { yPercent: 112 });
        ScrollTrigger.create({
          trigger: block,
          start: 'top 86%',
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

      /* stats count up */
      gsap.utils.toArray<HTMLElement>('.ordi-count').forEach(el => {
        const to = Number(el.dataset.to);
        const from = Number(el.dataset.from);
        const roman = el.dataset.roman === 'true';
        const o = { v: from };
        const paint = () => {
          el.textContent = roman && o.v >= to - 0.5 ? 'XII' : String(Math.round(o.v));
        };
        paint();
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'expo.out', onUpdate: paint, onComplete: paint }),
        });
      });

      const track = root.querySelector<HTMLElement>('.ordi-track');
      if (track) gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 52, repeat: -1 });

      /* segment tiles + timeline */
      gsap.utils.toArray<HTMLElement>('.og-seg').forEach(el => {
        gsap.set(el, { opacity: 0, y: 30 });
      });
      ScrollTrigger.batch('.og-seg', {
        start: 'top 92%',
        once: true,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.3, stagger: 0.07, ease: 'expo.out' }),
      });

      gsap.utils.toArray<HTMLElement>('.ordi-step').forEach((step, i) => {
        const line = step.querySelector('.ordi-step-line');
        const rest = step.querySelectorAll('.ordi-step-no, .ordi-step-tag, h3, p');
        gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(rest, { opacity: 0, y: 18 });
        ScrollTrigger.create({
          trigger: step,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            gsap.to(line, { scaleX: 1, duration: 1.8, ease: 'expo.out', delay: i * 0.08 });
            gsap.to(rest, { opacity: 1, y: 0, duration: 1.3, stagger: 0.08, ease: 'expo.out', delay: 0.15 + i * 0.08 });
          },
        });
      });
    }, root);

    const offReady = onSiteReady(() => {
      ctx.add(() => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to('.og-meta > *', { opacity: 1, y: 0, duration: 1.5, stagger: 0.15 }, 0.1)
          .to('.og-line', { yPercent: 0, duration: 2, stagger: 0.18 }, 0.15)
          .to('.og-foot > *', { opacity: 1, y: 0, duration: 1.5, stagger: 0.14 }, 1.0);
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);

    return () => {
      offReady();
      ctx.revert();
    };
  }, []);

  return (
    <main ref={rootRef} className="site-shell ordi-page">
      {/* ───────── Hero ───────── */}
      <section className="og" data-tone="dark">
        <div className="og-meta">
          <span>
            <i className="live" />
            Annual inter-school computer festival
          </span>
          <span>Delhi, India — est. 2004</span>
        </div>

        <h1 className="og-title" aria-label="Ordin@trix">
          <span className="mask og-row">
            <span className="og-line og-line--a">Ordin</span>
          </span>
          <span className="mask og-row">
            <span className="og-line og-line--b">@trix</span>
          </span>
        </h1>

        <div className="og-foot">
          <p>
            Where creativity, talent and skill share one stage. Run by the students and teachers of Tagore International
            School, Vasant Vihar.
          </p>
          <a className="cta-link cursor-target" href="/" data-cursor-label="Home">
            <span>Back to PYROTECH</span>
          </a>
        </div>
      </section>

      {/* ───────── 01 About ───────── */}
      <section className="og-about" data-tone="dark">
        <Head n="01" name="About" />
        <div className="og-about-grid">
          <h2 className="og-lead reveal-fade">A festival built by students, for students.</h2>
          <div className="og-bio reveal-fade">
            <p>
              Since 2004, Ordin@trix has been our yearly stage for young technologists, and it has grown into a flagship
              event for schools across the city. Every year a team of students and teachers sets a theme, and the
              competitions are built around it: movie making, coding, web design, app and game development, 3D and
              graphic design, robotics, photography and a lot more. It is open to students from classes III to XII.
            </p>
            <p>
              Creativity, talent and skill all meet here. What started as a state-level festival is now an international
              one, with schools from China, Japan and Oman competing. Our judges have included film and media
              personalities Mr. Amol Gupte and Miss Manju Singh, alongside experts from reputed IT and software
              companies, and entries from the floor have been screened at PVR Cinemas and the CHINH India Festival.
            </p>
          </div>
        </div>

        <ul className="ordi-stats" role="list">
          {ORDI_STATS.map(st => (
            <li className="ordi-stat" key={st.label}>
              <b className="ordi-num">
                <span
                  className="ordi-count"
                  data-to={st.value}
                  data-from={st.from}
                  data-roman={st.roman ? 'true' : undefined}
                >
                  {st.roman ? 'XII' : st.value}
                </span>
                {st.suffix ? <sup>{st.suffix}</sup> : null}
              </b>
              <span>{st.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="ordi-marquee ordi-marquee--page" data-tone="dark" aria-label="Competition segments">
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

      {/* ───────── 02 Segments ───────── */}
      <section className="og-segs" data-tone="dark">
        <Head n="02" name="Segments" />
        <h2 className="og-lead og-lead--wide reveal-fade">Pick your arena. A new theme every year.</h2>
        <ul className="og-seg-grid" role="list">
          {ORDI_SEGMENTS.map((seg, i) => (
            <li className="og-seg cursor-target" key={seg.name} data-cursor-label={seg.tag}>
              <span className="og-seg-no">{pad(i + 1)}</span>
              <b>{seg.name}</b>
              <span className="og-seg-tag">{seg.tag}</span>
            </li>
          ))}
          <li className="og-seg og-seg--more">
            <span className="og-seg-no">+</span>
            <b>And many more</b>
            <span className="og-seg-tag">Theme dependent</span>
          </li>
        </ul>
      </section>

      {/* ───────── 03 Journey ───────── */}
      <section className="og-journey" data-tone="dark">
        <Head n="03" name="Journey" />
        <h2 className="og-lead og-lead--wide reveal-fade">From a city event to an international stage.</h2>
        <ol className="ordi-path">
          {ORDI_MILESTONES.map((m, i) => (
            <li className="ordi-step cursor-target" key={m.tag} data-cursor-label={m.tag}>
              <i className="ordi-step-line" />
              <span className="ordi-step-no">{pad(i + 1)}</span>
              <span className="ordi-step-tag">{m.tag}</span>
              <h3>{m.title}</h3>
              <p>{m.line}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── 04 Recognition ───────── */}
      <section className="og-rec" data-tone="light" data-model="off">
        <Head n="04" name="On the record" />
        <div className="og-rec-grid">
          <div className="og-rec-col reveal-fade">
            <span className="og-rec-label">Judges have included</span>
            <ul role="list">
              <li>Mr. Amol Gupte</li>
              <li>Miss Manju Singh</li>
              <li>Experts from reputed IT and software companies</li>
            </ul>
          </div>
          <div className="og-rec-col reveal-fade">
            <span className="og-rec-label">Entries screened at</span>
            <ul role="list">
              <li>PVR Cinemas</li>
              <li>CHINH India Festival</li>
            </ul>
          </div>
          <div className="og-rec-col reveal-fade">
            <span className="og-rec-label">Schools joining from</span>
            <ul role="list">
              <li>India</li>
              <li>China</li>
              <li>Japan</li>
              <li>Oman</li>
            </ul>
          </div>
        </div>
      </section>

      <JoinSection index="05" name="Join" lineA="See you at" lineB="Ordin@trix." cta="Get in touch" />
    </main>
  );
}
