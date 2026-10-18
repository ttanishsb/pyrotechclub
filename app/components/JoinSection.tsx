'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DiscordIcon, GmailIcon, InstagramIcon } from './SocialIcons';

export const CONTACT_EMAIL = 'pyrotech@tagoreint.com';

type Props = {
  id?: string;
  /** Section number shown in the corner, e.g. "06". */
  index: string;
  name: string;
  /** Two display lines. The second one is set condensed. */
  lineA: string;
  lineB: string;
  cta?: string;
};

/**
 * The closing chapter. Full-bleed electric blue with black type: the loudest
 * contrast on the site, used once per page, plus the footer.
 */
export default function JoinSection({ id = 'join', index, name, lineA, lineB, cta = 'Find your way in' }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const copyDiscord = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('ppyrotechh');
    } catch {
      /* clipboard blocked: the username is printed on the button anyway */
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }, []);

  return (
    <section id={id} className="join" data-tone="light" data-model="off">
      <div className="section-head">
        <span className="section-num">{index}</span>
        <span className="section-name">{name}</span>
      </div>

      <h2 className="join-title reveal-block" aria-label={`${lineA} ${lineB}`}>
        <span className="mask">
          <span className="reveal-line join-line join-line--a">{lineA}</span>
        </span>
        <span className="mask">
          <span className="reveal-line join-line join-line--b">{lineB}</span>
        </span>
      </h2>

      <div className="join-actions reveal-fade">
        <a className="cta cta--ink cursor-target" href={`mailto:${CONTACT_EMAIL}`} data-cursor-label="Email">
          <span>{cta}</span>
        </a>

        <ul className="join-socials" role="list">
          <li>
            <button
              type="button"
              className="join-social cursor-target"
              onClick={copyDiscord}
              data-cursor-label="Copy"
              aria-label="Copy our Discord username, ppyrotechh"
            >
              <DiscordIcon />
              <span>{copied ? 'Copied' : 'ppyrotechh'}</span>
            </button>
          </li>
          <li>
            <a
              className="join-social cursor-target"
              href="https://www.instagram.com/tagoreint_vasantvihar/"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="Instagram"
              aria-label="Instagram: tagoreint_vasantvihar"
            >
              <InstagramIcon />
              <span>tagoreint_vasantvihar</span>
            </a>
          </li>
          <li>
            <a
              className="join-social cursor-target"
              href={`mailto:${CONTACT_EMAIL}`}
              data-cursor-label="Email"
              aria-label={`Email: ${CONTACT_EMAIL}`}
            >
              <GmailIcon />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </li>
        </ul>
      </div>

      <footer className="foot">
        <a className="brand brand--ink cursor-target" href="/" data-cursor-label="Home">
          PYROTECH
        </a>
        <p>Tagore International School, Vasant Vihar. Built by students.</p>
        <nav aria-label="Footer">
          <a className="cursor-target" href="/">
            Home
          </a>
          <a className="cursor-target" href="/members">
            Members
          </a>
        </nav>
      </footer>
    </section>
  );
}
