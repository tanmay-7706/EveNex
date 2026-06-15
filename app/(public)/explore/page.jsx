// NO 'use client' here — this is a Server Component
import ExploreClient from './ExploreClient';

export const metadata = {
  title: 'Explore Events | EveNex',
  description: 'Discover featured events, find what\'s happening locally, or browse events across India',
};

export default function ExplorePage() {
  return <ExploreClient />;
}