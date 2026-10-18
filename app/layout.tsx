import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import SmoothScroll from './components/SmoothScroll';
import SiteChrome from './components/SiteChrome';
import { SITE_URL } from './lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PYROTECH | Student Technology Collective, Tagore International School Vasant Vihar',
    template: '%s | PYROTECH',
  },
  description:
    'PYROTECH is the student technology collective of Tagore International School, Vasant Vihar, Delhi: web design, software, image editing, filmmaking and 3D modelling. Home of Ordin@trix, the annual inter-school computer festival since 2004.',
  keywords: [
    'PYROTECH',
    'Pyrotech Tagore International School',
    'Tagore International School Vasant Vihar',
    'Ordinatrix',
    'Ordin@trix',
    'inter-school computer festival Delhi',
    'school coding competition Delhi',
    'student technology club Delhi',
  ],
  applicationName: 'PYROTECH',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    title: 'PYROTECH | We make things happen',
    description: 'Student builders at Tagore International School, Vasant Vihar. Home of the Ordin@trix inter-school computer festival.',
    url: '/',
    siteName: 'PYROTECH',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'PYROTECH' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PYROTECH | We make things happen',
    description: 'Student technology collective and home of Ordin@trix, Delhi.',
    images: ['/og.png'],
  },
  // After adding your site in Google Search Console, paste the verification code here (or set the env var).
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'PYROTECH',
      alternateName: ['Pyrotech Tagore International School', 'Pyrotech Student Technology Collective'],
      url: SITE_URL,
      logo: `${SITE_URL}/og.png`,
      email: 'pyrotech@tagoreint.com',
      parentOrganization: {
        '@type': 'EducationalOrganization',
        name: 'Tagore International School, Vasant Vihar',
        address: { '@type': 'PostalAddress', addressLocality: 'Vasant Vihar, New Delhi', addressCountry: 'IN' },
      },
      sameAs: ['https://www.instagram.com/tagoreint_vasantvihar/'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'PYROTECH',
      publisher: { '@id': `${SITE_URL}/#org` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'Event',
      name: 'Ordin@trix: Annual Inter-School Computer Festival',
      alternateName: 'Ordinatrix',
      description:
        'Annual inter-school computer festival since 2004 with competitions in movie making, coding, web designing, app development, game development, 3D designing, graphic designing, robotics and photography for classes III to XII.',
      organizer: { '@id': `${SITE_URL}/#org` },
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Tagore International School, Vasant Vihar', address: { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressCountry: 'IN' } },
      url: `${SITE_URL}/#ordinatrix`,
    },
  ],
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

// Archivo is a variable font with a width axis (62-125) and a weight axis (100-900).
// The whole site's contrast comes from using those two axes: expanded vs condensed, light vs black.
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900' +
  '&family=DM+Mono:wght@400;500' +
  '&family=IBM+Plex+Mono:wght@500;600;700' +
  '&display=swap';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_URL} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <SmoothScroll>
          <SiteChrome>{children}</SiteChrome>
        </SmoothScroll>
      </body>
    </html>
  );
}