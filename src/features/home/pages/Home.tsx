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
 * Home â€” landing page cho guest (khÃ´ng cáº§n Ä‘Äƒng nháº­p).
 * Trang nÃ y thuá»™c feature 'public/home' (khÃ¡ch vÃ£ng lai).
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
