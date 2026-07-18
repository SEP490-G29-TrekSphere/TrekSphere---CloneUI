import React, { Suspense } from 'react';
import HomeCompanions from '@/features/home/components/HomeCompanions';
import HomeDestinations from '@/features/home/components/HomeDestinations';
import HomeHero from '@/features/home/components/HomeHero';
import HomeNewsletter from '@/features/home/components/HomeNewsletter';
import HomeStories from '@/features/home/components/HomeStories';
import HomeTestimonials from '@/features/home/components/HomeTestimonials';
import HomeTours from '@/features/home/components/HomeTours';
import HomeWhyChooseUs from '@/features/home/components/HomeWhyChooseUs';

// Lazy load 3D Globe section to maintain optimal initial loading speeds
const HomeMap = React.lazy(() => import('@/features/home/components/HomeMap'));

function MapSkeleton() {
  return (
    <div className="py-24 bg-muted/20 border-y border-border/40 animate-pulse">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 h-[580px]">
          <div className="rounded-3xl bg-muted h-full w-full" />
          <div className="flex flex-col justify-center space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<MapSkeleton />}>
        <HomeMap />
      </Suspense>
      <HomeTestimonials />
      <HomeCompanions />
      <HomeWhyChooseUs />
      <HomeStories />
      <HomeNewsletter />
    </>
  );
}
