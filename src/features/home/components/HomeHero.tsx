import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppButton } from '@/shared/ui';

export default function HomeHero() {
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('');

  return (
    <section
      className="relative w-full h-[640px] flex items-center justify-center"
      style={{
        backgroundImage:
          'linear-gradient(rgba(31,57,51,0.35), rgba(31,57,51,0.5)), url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-[1200px] w-full px-4 sm:px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight max-w-[900px] mx-auto">
          Chinh phục những đỉnh cao mới cùng TrekSphere
        </h1>

        <p className="mt-5 text-white/90 text-base md:text-lg leading-relaxed max-w-[720px] mx-auto">
          Trải nghiệm trekking chuyên nghiệp, an toàn và bền vững cùng đội ngũ chuyên gia hàng đầu.
          Khám phá vẻ đẹp hùng vĩ của núi rừng Việt Nam qua những hành trình độc bản.
        </p>

        <Link to={PATHS.TOURS}>
          <AppButton
            type="button"
            className="mt-8 px-6 py-2.5 rounded-full border border-white/80 text-white
              text-sm font-semibold hover:bg-white hover:text-primary
              transition-colors backdrop-blur-sm"
          >
            Khám phá ngay
          </AppButton>
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-10 mx-auto grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-center
            max-w-[760px] w-full rounded-2xl md:rounded-full shadow-lg bg-background overflow-hidden"
        >
          <label
            className="flex items-center gap-2 px-5 py-3 border-b md:border-b-0 md:border-r border-border
              focus-within:bg-muted/40 transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6F7B75"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Bạn muốn đi đâu?"
              aria-label="Điểm đến"
              className="w-full bg-transparent text-sm outline-none text-primary
                placeholder:text-muted-foreground"
            />
          </label>

          <label
            className="flex items-center gap-2 px-5 py-3 border-b md:border-b-0 border-border
              focus-within:bg-muted/40 transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6F7B75"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Thời gian"
              aria-label="Thời gian"
              className="w-full bg-transparent text-sm outline-none text-primary
                placeholder:text-muted-foreground"
            />
          </label>

          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="flex items-center justify-center gap-2 px-6 py-3 md:py-0 md:h-full
              text-primary hover:text-primary-hover transition-colors
              border-t md:border-t-0 border-border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-sm font-semibold md:hidden">Tìm kiếm</span>
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
