'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Portrait from './Portrait';
import JoinSection from './JoinSection';
import { DISCIPLINES, coreTeam, members, pad, type Discipline, type Member } from '../data/members';
import { onSiteReady } from '../lib/ready';

gsap.registerPlugin(ScrollTrigger);

type Filter = 'All' | Discipline;

function MemberCard({ member, index, size }: { member: Member; index: number; size: 'core' | 'regular' }) {
  return (
    <article className={`m-card m-card--${size} cursor-target`} data-cursor-label={member.discipline ?? member.title}>
      <Portrait member={member} index={index} />
      <div className="m-meta">
        <h3 className="m-name">{member.name}</h3>
        <p className="m-title">{member.title}</p>
      </div>
    </article>
  );
}

export default function MembersView() {
  const rootRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const firstRender = useRef(true);
  const reduce = useRef(false);

  const visible = filter === 'All' ? members : members.filter(m => m.discipline === filter);
  const total = coreTeam.length + members.length;

  // (Re)build the staggered reveal for the given cards.
  // Cards that are already above the viewport are shown immediately, and both scroll
  // directions reveal, so nothing can get stuck invisible after a filter change.
  const buildReveal = useCallback((selector: string) => {
    const root = rootRef.current;
    if (!root || reduce.current) return;
    triggersRef.current.forEach(t => t.kill());
    const cards = gsap.utils.toArray<HTMLElement>(selector, root);
    gsap.set(cards, { opacity: 0, y: 56 });
    const show = (batch: Element[]) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', overwrite: true });
    triggersRef.current = ScrollTrigger.batch(cards, {
      start: 'top 92%',
      onEnter: show,
      onEnterBack: show,
    });
    cards.forEach(card => {
      if (card.getBoundingClientRect().bottom < 0) gsap.set(card, { opacity: 1, y: 0 });
    });
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce.current) return;

    const ctx = gsap.context(() => {
      gsap.set('.mh-line', { yPercent: 112 });
      gsap.set('.mh-meta > *, .mh-foot > *', { opacity: 0, y: 18 });

      gsap.to('.mh-title', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.mh', start: 'top top', end: 'bottom top', scrub: 1.4 },
      });

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
    }, root);

    buildReveal('.m-card');

    const offReady = onSiteReady(() => {
      ctx.add(() => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to('.mh-meta > *', { opacity: 1, y: 0, duration: 1.5, stagger: 0.15 }, 0.1)
          .to('.mh-line', { yPercent: 0, duration: 2, stagger: 0.18 }, 0.15)
          .to('.mh-foot > *', { opacity: 1, y: 0, duration: 1.5, stagger: 0.14 }, 1.0);
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);

    return () => {
      offReady();
      triggersRef.current.forEach(t => t.kill());
      triggersRef.current = [];
      ctx.revert();
    };
  }, [buildReveal]);

  // After a filter change commits, reveal the new set of cards.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = requestAnimationFrame(() => buildReveal('.m-card--regular'));
    return () => cancelAnimationFrame(id);
  }, [filter, buildReveal]);

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    const root = rootRef.current;
    if (!root || reduce.current) {
      setFilter(next);
      return;
    }
    const cards = gsap.utils.toArray<HTMLElement>('.m-card--regular', root);
    gsap.to(cards, {
      opacity: 0,
      y: -24,
      duration: 0.6,
      stagger: 0.02,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => setFilter(next),
    });
  };

  const filters: Filter[] = ['All', ...DISCIPLINES];
  const countFor = (f: Filter) => (f === 'All' ? members.length : members.filter(m => m.discipline === f).length);

  return (
    <main ref={rootRef} className="site-shell members-page">
      {/* ───────── Hero ───────── */}
      <section className="mh" data-tone="dark">
        <div className="mh-meta">
          <span>Pyrotech members</span>
          <span>({pad(total)})</span>
        </div>

        <h1 className="mh-title" aria-label="The roster">
          <span className="mask mh-row">
            <span className="mh-line mh-line--a">The</span>
          </span>
          <span className="mask mh-row">
            <span className="mh-line mh-line--b">roster</span>
          </span>
        </h1>

        <div className="mh-foot">
          <p>The students behind the builds. Programmers, gamers, filmmakers, photographers and builders, in one room.</p>
        </div>
      </section>

      {/* ───────── Core team ───────── */}
      <section className="m-section" data-tone="dark">
        <div className="m-grid m-grid--core">
          {coreTeam.map((m, i) => (
            <MemberCard key={i} member={m} index={i + 1} size="core" />
          ))}
        </div>
      </section>

      {/* ───────── Everyone ───────── */}
      <section className="m-section" data-tone="dark">
        <div className="m-filters" role="group" aria-label="Filter members by discipline">
          {filters.map(f => (
            <button
              key={f}
              type="button"
              className={'m-filter cursor-target' + (filter === f ? ' is-active' : '')}
              aria-pressed={filter === f}
              data-cursor-label="Filter"
              onClick={() => changeFilter(f)}
            >
              <span>{f}</span>
              <sup>{pad(countFor(f))}</sup>
            </button>
          ))}
        </div>

        <div className="m-grid m-grid--all">
          {visible.map((m, i) => (
            <MemberCard key={`${filter}-${i}`} member={m} index={coreTeam.length + members.indexOf(m) + 1} size="regular" />
          ))}
        </div>
        {visible.length === 0 && <p className="m-empty">No members in this discipline yet.</p>}
      </section>

      {/* ───────── Join ───────── */}
      <JoinSection index="03" name="Join" lineA="Your name" lineB="goes here." />
    </main>
  );
}