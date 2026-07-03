import HomeCompanions from '../components/HomeCompanions';
import HomeDestinations from '../components/HomeDestinations';
import HomeHero from '../components/HomeHero';
import HomeNewsletter from '../components/HomeNewsletter';
import HomeStories from '../components/HomeStories';
import HomeTours from '../components/HomeTours';
import HomeWhyChooseUs from '../components/HomeWhyChooseUs';

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
      <HomeDestinations />
      <HomeTours />
      <HomeCompanions />
      <HomeWhyChooseUs />
      <HomeStories />
      <HomeNewsletter />
    </>
  );
}
