# PYROTECH

Next.js + TypeScript site for the PYROTECH student technology collective
(Tagore International School, Vasant Vihar).

Stack: GSAP + ScrollTrigger, Lenis smooth scroll, React Three Fiber, and four
[React Bits](https://reactbits.dev) components: **StaggeredMenu**, **ShapeWaves**,
**ASCIIText**, **TargetCursor**.

## Run it

```bash
npm install        # installs gsap, lenis, three, r3f, and vgpu (needed by ShapeWaves)
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Fill in the Members page

Open **`app/data/members.ts`**. Everything on `/members` (and the roster preview
on the home page) comes from that one file.

1. Put each photo in `public/members/` (portrait 4:5, 800px+ wide), e.g. `public/members/aarav-sharma.jpg`
2. Edit the entry:
   ```ts
   { name: 'Aarav Sharma', title: 'Lead, Software', discipline: 'Software', image: '/members/aarav-sharma.jpg' }
   ```
3. `discipline` powers the filter pills; use one of: Web design, Software, Image editing, Filmmaking, 3D modelling.
4. `coreTeam` is shown large at the top; `members` is the filterable grid. Add or delete entries freely.

Photos display in black & white and bloom to colour on hover.

## Where things live

| What | Where |
| --- | --- |
| Home page sections + scroll animation | `app/components/PyrotechLanding.tsx` |
| Members page | `app/components/MembersView.tsx`, data in `app/data/members.ts` |
| Intro loader (waits for the 3D model), page transitions, background, cursor, menu, scroll HUD | `app/components/SiteChrome.tsx` |
| Menu items + social links | top of `SiteChrome.tsx` (`MENU_ITEMS`, `SOCIAL_ITEMS`) |
| Menu component (adapted from React Bits) | `app/components/StaggeredMenu.tsx` / `.css` |
| Smooth scroll (Lenis, slowed) | `app/components/SmoothScroll.tsx` |
| Closing blue section + footer + contact email | `app/components/JoinSection.tsx` |
| Colours, type, every section's styling | `app/globals.css` (tokens at the top) |
| 3D model scene | `app/components/ModelScene.tsx` |

Contact: `pyrotech@tagoreint.com` (change `CONTACT_EMAIL` in `JoinSection.tsx`).
Socials: Discord `ppyrotechh` (click copies, Discord has no profile URL), Instagram
`tagoreint_vasantvihar`, Gmail `pyrotech@tagoreint.com`.

## The 3D model

The model lives at `public/models/danda.glb`. Replace that file to swap it.

## Design system, briefly

- **Contrast is the system.** Chapters alternate black, ice white, black, electric blue (`#168BFF`).
- **Type contrast comes from width and fill.** Archivo's width axis: expanded vs condensed.
  Outline = what we are not, solid = what we make.
- **Slow on purpose.** Lenis `lerp: 0.072`, expo easings, 1.2-2s durations. To change the overall feel,
  start with `SmoothScroll.tsx` and the durations in `StaggeredMenu.tsx` / `PyrotechLanding.tsx`.
- Content that ends up as light chapters sets `data-tone="light"`; the header and HUD flip colour automatically.
  Sections that cover the 3D model set `data-model="off"`.

## Browser notes

- **ShapeWaves needs WebGPU** (Chrome/Edge, recent Safari). Elsewhere the site shows a static dotted
  fallback instead, and everything else works.
- **ASCIIText needs WebGL2**; it falls back to plain text.
- The custom cursor only appears with a mouse; touch devices keep the normal one.
- `prefers-reduced-motion` disables smooth scroll, the intro curtain and the scroll animations.

## SEO / Google Search Console

1. Deploy, then set `NEXT_PUBLIC_SITE_URL` to your real domain (used by canonical URLs, sitemap, robots, structured data).
2. In Search Console add the property, copy the verification code, set `NEXT_PUBLIC_GOOGLE_VERIFICATION`, redeploy, click Verify.
3. Submit `https://YOUR-DOMAIN/sitemap.xml` and use URL Inspection > Request indexing on the home page.

## Pages

- `/` landing, with a short Ordin@trix teaser and a "Know more" button
- `/ordinatrix` full Ordin@trix page (`app/components/OrdinatrixView.tsx`, content in `app/data/ordinatrix.ts`)
- `/members`

`FitLines.tsx` scales any giant headline down if it would be wider than its box, so text never clips or wraps.
