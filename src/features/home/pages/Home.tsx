import HomeCompanions from '@/features/home/components/HomeCompanions';
import HomeHero from '@/features/home/components/HomeHero';
import HomeStories from '@/features/home/components/HomeStories';
import HomeTours from '@/features/home/components/HomeTours';

/**
 * Home — landing page cho guest (không cần đăng nhập).
 * Trang này thuộc feature 'public/home' (khách vãng lai).
 *
 * Header/Footer được render bởi PublicLayout ở routes/AppRoutes.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeTours />
      <HomeCompanions />
      <HomeStories />
    </>
  );
}
