/**
 * ─────────────────────────────────────────────────────────────
 *  PYROTECH — MEMBERS
 *  Everything on the Members page (and the roster preview on the
 *  home page) comes from this file. Edit the entries below.
 *
 *  How to fill a member in:
 *    1. Save their photo in  /public/members/  (portrait, 4:5, 800px+ wide)
 *       e.g.  public/members/aarav-sharma.jpg
 *    2. Edit their entry:
 *         { name: 'Aarav Sharma', title: 'Lead, Software',
 *           discipline: 'Software', image: '/members/aarav-sharma.jpg' }
 *
 *  `discipline` drives the filter on the Members page. It must be
 *  one of the values in DISCIPLINES below.
 *  Leave `image` empty to keep the placeholder frame.
 *  Add or remove entries freely - the layout adapts.
 * ─────────────────────────────────────────────────────────────
 */

export const DISCIPLINES = ['Programming', 'Gaming', 'Media', 'Creative', 'Crypt', 'Robotics'] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export type Member = {
  name: string;
  title: string;
  /** Drives the filter on the Members page. Optional: leave out for leadership / general members. */
  discipline?: Discipline;
  /** Path under /public, e.g. '/members/first-last.jpg'. Empty = placeholder frame. */
  image?: string;
};

/** Leadership. Shown larger, above everyone else. */
export const coreTeam: Member[] = [
  { name: 'Aneira Shewaramani', title: 'President', image: '/members/aneira.jpg' },
  { name: 'Akshat Hatwal', title: 'Vice President', image: '/members/akshat.jpg' },
];

/** Everyone else. */
export const members: Member[] = [
  { name: 'Shaurya Singh', title: 'Programming Head/Web Developer', discipline: 'Programming', image: '/members/shaurya.jpg' },
  { name: 'Tanish Singh Bisht', title: 'Web Developer/Programmer', discipline: 'Programming', image: '/members/tanish.jpg' },
  { name: 'AR Nadal', title: 'Programmer', discipline: 'Programming', image: '/members/nadal.jpg' },
  { name: 'Viraaj Bhardwaj', title: 'Gaming Head', discipline: 'Gaming', image: '/members/viraaj.jpg' },
  { name: 'Yana Pawar', title: 'Movie Making Head', discipline: 'Media', image: '/members/yana.jpg' },
  { name: 'Shaarav Katoch', title: 'Photography Head', discipline: 'Media', image: '/members/shaarav.jpg' },
  { name: 'Aradhya Bhola', title: 'Photography Head', discipline: 'Media', image: '/members/aradhya.jpg' },
  { name: 'Jayden Haokip', title: 'Editing Head', discipline: 'Media', image: '/members/jayden.jpg' },
  { name: 'Jyotirmay Routray', title: 'Creative Head', discipline: 'Creative', image: '/members/jyotirmay.jpg' },
  { name: 'Medhansh Mathur', title: 'Crypt Head', discipline: 'Crypt', image: '/members/medhansh.jpg' },
  { name: 'Neelanjan Pal', title: 'Crypt Head', discipline: 'Crypt', image: '/members/neelanjan.jpg' },
  { name: 'Saksham Gupta', title: 'Robotics Head', discipline: 'Robotics', image: '/members/saksham.jpg' },
  { name: 'Abeer Kumar', title: 'Member', image: '/members/abeer.jpg' },
];

export const pad = (n: number) => String(n).padStart(2, '0');
