import PublicFooter from '@/shared/layout/PublicFooter';
import PublicHeader from '@/shared/layout/PublicHeader';
import HomeCompanions from './sections/HomeCompanions';
import HomeDestinations from './sections/HomeDestinations';
import HomeHero from './sections/HomeHero';
import HomeNewsletter from './sections/HomeNewsletter';
import HomeStories from './sections/HomeStories';
import HomeTours from './sections/HomeTours';
import HomeWhyChooseUs from './sections/HomeWhyChooseUs';

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
