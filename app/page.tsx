import Hero from './components/home/Hero';
import { getHomeData, getGalleryFeed } from '@/app/actions/home';
import LatestPostsGrid from './components/home/LatestPostsGrid';
import CinematicGallery from './components/home/CinematicGallery';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [boardData, galleryData] = await Promise.all([
    getHomeData(),
    getGalleryFeed()
  ]);

  return (
    <div className="pb-20">
      <Hero />

      {/* Latest Posts Section */}
      <LatestPostsGrid boards={boardData} />

      {/* Cinematic Gallery Section */}
      {galleryData.length > 0 && <CinematicGallery posts={galleryData} />}
    </div>
  );
}
