import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

export default function HomeCompanions() {
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        opacity: 0,
        y: 48,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="companions-banner min-h-[480px]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80')]"
        aria-hidden="true"
      />
      {/* Deep gradient overlay */}
      <div className="companions-banner-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-12 py-24 max-w-3xl mx-auto min-h-[480px]">
        {/* Text block */}
        <div ref={textRef} className="text-white">
          <h2 className="text-4xl md:text-5xl font-black leading-tight mt-2">Tìm bạn đồng hành</h2>
          <p className="mt-5 text-white/80 text-base leading-relaxed">
            Kết nối với cộng đồng trekker đam mê của TrekSphere. Tìm kiếm, trao đổi kinh nghiệm và
            cùng nhau chinh phục những cung đường mơ ước.
          </p>
          <Link
            to={PATHS.COMMUNITY}
            className="inline-block mt-8 px-7 py-3.5 rounded-full font-bold text-sm cursor-pointer
              text-primary bg-white hover:bg-white/90 transition-all hover:scale-[1.03] shadow-lg text-center"
          >
            Tham gia nhóm ngay
          </Link>
        </div>
      </div>
    </section>
  );
}
