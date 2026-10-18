import type { Metadata } from 'next';
import MembersView from '../components/MembersView';

export const metadata: Metadata = {
  title: 'Members',
  alternates: { canonical: '/members' },
  description: 'The students behind the builds: PYROTECH, Tagore International School, Vasant Vihar.',
};

export default function MembersPage() {
  return <MembersView />;
}
