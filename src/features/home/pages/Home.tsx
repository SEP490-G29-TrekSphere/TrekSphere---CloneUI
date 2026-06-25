import HomeCompanions from '../components/HomeCompanions';
import HomeDestinations from '../components/HomeDestinations';
import HomeHero from '../components/HomeHero';
import HomeNewsletter from '../components/HomeNewsletter';
import HomeStories from '../components/HomeStories';
import HomeTours from '../components/HomeTours';
import HomeWhyChooseUs from '../components/HomeWhyChooseUs';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

/**
 * Home — landing page cho guest (không cần đăng nhập).
 * Trang này thuộc feature 'public/home' (khách vãng lai).
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F1' }}>
      <PublicHeader />

      <main className="flex-1 pt-16">
        <HomeHero />
        <HomeDestinations />
        <HomeTours />
        <HomeCompanions />
        <HomeWhyChooseUs />
        <HomeStories />
        <HomeNewsletter />
      </main>

      <PublicFooter />
    </div>
  );
}
