import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

const AVATARS = [
  'https://i.pravatar.cc/80?img=11',
  'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=13',
  'https://i.pravatar.cc/80?img=14',
  'https://i.pravatar.cc/80?img=15',
];

export default function HomeCompanions() {
  const textRef = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        opacity: 0,
        x: -48,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
      gsap.from(avatarsRef.current, {
        opacity: 0,
        x: 48,
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
        className="companions-banner-bg bg-[url('https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1920&q=80')]"
        aria-hidden="true"
      />

      {/* Deep gradient overlay */}
      <div className="companions-banner-overlay" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 px-6 sm:px-12 lg:px-24 py-24">
        {/* Text block */}
        <div ref={textRef} className="flex-1 text-white max-w-xl">
          <span className="section-eyebrow text-white/50">Cộng đồng trekker</span>
          <h2 className="text-4xl md:text-5xl font-black leading-tight mt-2">Tìm bạn đồng hành</h2>
          <p className="mt-5 text-white/80 text-base leading-relaxed">
            Đừng để hành trình đơn độc. Kết nối với hàng ngàn trekker cùng đam mê, chia sẻ kinh
            nghiệm và cùng nhau chinh phục những đỉnh cao.
          </p>
          <Link
            to={PATHS.COMMUNITY}
            className="inline-block mt-8 px-7 py-3.5 rounded-full font-bold text-sm cursor-pointer
              text-primary bg-white hover:bg-white/90 transition-all hover:scale-[1.03] shadow-lg text-center"
          >
            Tham gia nhóm ngay
          </Link>
        </div>

        {/* Avatar stack + count — glassmorphism pill */}
        <div
          ref={avatarsRef}
          className="flex flex-col items-center gap-4 shrink-0 rounded-3xl px-8 py-7
            bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
        >
          <div className="flex items-center">
            {AVATARS.map((src, idx) => (
              <div
                key={src}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white/60"
                style={{ marginLeft: idx === 0 ? 0 : '-10px', zIndex: AVATARS.length - idx }}
              >
                <img src={src} alt={`Trekker ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-xs
                bg-secondary text-primary border-2 border-white/60"
              style={{ marginLeft: '-10px', zIndex: 0 }}
            >
              <span className="sr-only">Hơn 1000 thành viên</span>
              <span aria-hidden="true">+1K</span>
            </div>
          </div>
          <p className="text-white/80 text-sm font-medium text-center">
            Cộng đồng <span className="text-white font-bold">10,000+</span> trekker
          </p>
        </div>
      </div>
    </section>
  );
}
