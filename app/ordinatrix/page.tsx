import type { Metadata } from 'next';
import OrdinatrixView from '../components/OrdinatrixView';

export const metadata: Metadata = {
  title: 'Ordin@trix | Annual Inter-School Computer Festival, Delhi',
  description:
    'Ordin@trix is the annual inter-school computer festival run since 2004 by Tagore International School, Vasant Vihar: coding, movie making, robotics, web, app and game development, 3D, graphic design and photography for classes III to XII.',
  alternates: { canonical: '/ordinatrix' },
  keywords: ['Ordinatrix', 'Ordin@trix', 'inter-school computer festival', 'school coding competition Delhi', 'Tagore International School'],
};

export default function OrdinatrixPage() {
  return <OrdinatrixView />;
}
