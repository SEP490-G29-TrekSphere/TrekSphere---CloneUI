import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNewsDetailPath, PATHS } from '@/constants';
import { useBlogList } from '@/features/news/hooks/useBlog';
import { useFeaturedTours } from '@/features/tours/hooks/useFeaturedTours';
import type { Tour } from '@/features/tours/types';
import { stripHtml } from '@/utils/sanitize';

const REMOTE_ASSETS = {
  fontOgg: '/cinematic/OggText-Medium.woff2',
  sky: '/cinematic/sky.png',
  backFour: '/cinematic/backFour.png',
  bazaar: '/cinematic/bazaar.png',
  splitLeft: '/cinematic/splitLeft.png',
  splitRight: '/cinematic/splitRight.png',
  bridge: '/cinematic/bridge.png',
  frameTwo: '/cinematic/frameTwo.png',
};

const TOUR_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

export default function CinematicScrollLanding() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  const { tours, isLoading: toursLoading } = useFeaturedTours();
  const { data: blogData, isLoading: storiesLoading } = useBlogList({
    page: 1,
    size: 3,
    sortBy: 'viewCount',
    sortDir: 'desc',
  });
  const stories = blogData?.items ?? [];

  // Engine state — a single rAF-batched flag, no mouse tracking and no scroll easing/lerp:
  // values are pure functions of native scroll position, so there's nothing to keep animating
  // once the scroll event settles (fewer moving parts, less to feel laggy).
  const rafPendingRef = useRef(false);

  // Story cards — driven by the same rAF/scroll engine as the hero, for a layer-separated parallax
  const storyCardsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    // Math helpers
    const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const smoothstep = (e0: number, e1: number, v: number) => {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    };

    const getScrollDistance = () => {
      if (!sectionEl) return 0;
      const rect = sectionEl.getBoundingClientRect();
      return clamp(-rect.top, 0, sectionEl.offsetHeight - window.innerHeight);
    };

    // Main animation update loop — every value is a pure function of scroll position,
    // driven straight off native scroll with no mouse parallax and no lerp/easing on top.
    // That keeps each rAF tick to one layout read + a batch of style writes, and there's
    // nothing left to keep animating once the scroll event itself settles.
    const update = () => {
      rafPendingRef.current = false;

      const scroll = getScrollDistance();

      const progress = clamp(scroll / 2100);
      const introExit = smoothstep(40, 300, scroll);

      // Story panel 1 (Frame 2): active 220px to 880px
      const frame2Enter = smoothstep(40, 260, scroll);
      const frame2Exit = smoothstep(720, 920, scroll);
      const panel2Opacity = frame2Enter * (1 - frame2Exit);

      // Story panel 2 (Frame 3): active 840px to 1480px
      const frame3Enter = smoothstep(820, 1020, scroll);
      const frame3Exit = smoothstep(1320, 1520, scroll);
      const panel3Opacity = frame3Enter * (1 - frame3Exit);

      // Tour scene: takes over right after Scene 3 exits, stays visible through the rest of the pin
      const toursSceneEnter = smoothstep(1300, 1560, scroll);

      const shadeActive = clamp(panel2Opacity + panel3Opacity + toursSceneEnter * 0.55);

      // Frame 2 Mountain Background is pre-faded in at 0.35 and stays at 1.0 continuously
      // through the entire middle scroll sequence, avoiding any black gap!
      const frame2Opacity = Math.max(0.35, frame2Enter);
      const splitDrift = smoothstep(40, 340, scroll) ** 1.3;

      const backScale = 0.76 + progress * 0.2 + frame2Enter * 0.18 + frame3Enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;

      // Update CSS Variables on section element
      const style = sectionEl.style;
      style.setProperty('--back-scale', backScale.toFixed(4));
      style.setProperty('--four-y', `${(10 + progress * 10).toFixed(2)}vh`);
      style.setProperty('--four-scale', (0.78 + progress * 0.16).toFixed(4));
      style.setProperty('--bazaar-y', `${(20 - progress * 8).toFixed(2)}vh`);

      style.setProperty('--shade-z', shadeActive > 0.02 ? '2' : '0');
      style.setProperty('--shade-top-alpha', (shadeActive * 0.2).toFixed(4));
      style.setProperty('--shade-mid-alpha', (shadeActive * 0.15).toFixed(4));
      style.setProperty('--shade-bottom-alpha', (shadeActive * 0.25).toFixed(4));

      style.setProperty('--title-y', `${(introExit * -210).toFixed(2)}px`);
      style.setProperty('--title-scale', (1 - introExit * 0.08).toFixed(4));
      style.setProperty('--title-opacity', (1 - introExit).toFixed(4));

      style.setProperty('--bridge-y', `${(sharedHeroY - frame2Exit * 760).toFixed(2)}px`);
      style.setProperty('--bridge-bottom', `${(5 - frame2Enter * 13).toFixed(2)}vh`);
      style.setProperty('--bridge-width', `${(67.2 + frame2Enter * 37.8).toFixed(2)}vw`);
      style.setProperty('--bridge-scale', (1.02 + sharedHeroScale + frame2Exit * 0.46).toFixed(4));

      style.setProperty('--split-left-x', `${(-splitDrift * 46).toFixed(2)}vw`);
      style.setProperty('--split-left-y', `${(sharedHeroY - splitDrift * 180).toFixed(2)}px`);
      style.setProperty(
        '--split-left-scale',
        (1 + sharedHeroScale + frame2Enter * 0.74).toFixed(4)
      );

      style.setProperty('--split-right-x', `${(splitDrift * 46).toFixed(2)}vw`);
      style.setProperty('--split-right-y', `${(sharedHeroY - splitDrift * 180).toFixed(2)}px`);
      style.setProperty(
        '--split-right-scale',
        (1 + sharedHeroScale + frame2Enter * 0.74).toFixed(4)
      );

      style.setProperty('--frame2-opacity', frame2Opacity.toFixed(4));
      style.setProperty('--frame2-y', `${(-frame2Exit * 150).toFixed(2)}px`);
      style.setProperty(
        '--frame2-scale',
        (1.06 + frame2Enter * 0.08 + frame2Exit * 0.08).toFixed(4)
      );

      style.setProperty('--intro-copy-y', `${(introExit * 90).toFixed(2)}px`);
      style.setProperty('--intro-copy-opacity', (1 - introExit).toFixed(4));

      style.setProperty('--panel2-opacity', panel2Opacity.toFixed(4));
      style.setProperty(
        '--panel2-y',
        `${(-frame2Exit * 86 + (1 - frame2Enter) * 58).toFixed(2)}px`
      );

      style.setProperty('--panel3-opacity', panel3Opacity.toFixed(4));
      style.setProperty(
        '--panel3-y',
        `${(-frame3Exit * 86 + (1 - frame3Enter) * 58).toFixed(2)}px`
      );

      style.setProperty('--tours-scene-opacity', toursSceneEnter.toFixed(4));
      style.setProperty('--tours-scene-y', `${((1 - toursSceneEnter) * 48).toFixed(2)}px`);
      style.setProperty('--tours-scene-visibility', scroll > 1260 ? 'visible' : 'hidden');
    };

    const requestTick = () => {
      if (!rafPendingRef.current) {
        rafPendingRef.current = true;
        requestAnimationFrame(update);
      }
    };

    const handleScroll = () => {
      requestTick();
    };

    const handleResize = () => {
      requestTick();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial frame trigger
    requestTick();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Story cards reveal once, via IntersectionObserver + a plain CSS transition —
  // no per-frame JS, no scroll-linked recompute, just a class toggle the compositor animates.
  useEffect(() => {
    const cards = storyCardsRef.current.filter((card): card is HTMLElement => Boolean(card));
    if (cards.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      for (const card of cards) {
        card.classList.add('is-visible');
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    for (const card of cards) {
      observer.observe(card);
    }

    return () => observer.disconnect();
    // biome-ignore lint/correctness/useExhaustiveDependencies: stories ref is stable, no re-run needed
  }, []);

  return (
    <div className="relative w-full bg-[var(--c-bg)] text-[var(--paper)]">
      {/* Dynamic Font & Keyframe Styles inject */}
      <style>{`
        @font-face {
          font-family: "Ogg Medium";
          src: url("${REMOTE_ASSETS.fontOgg}") format("woff2");
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }

        :root {
          --back-scale: 0.76;
          --four-y: 10vh; --four-scale: 0.78;
          --bazaar-y: 20vh;
          --shade-z: 2;
          --shade-top-alpha: 0; --shade-mid-alpha: 0; --shade-bottom-alpha: 0;
          --blur-tint: 16, 185, 129;
          --title-y: 0px; --title-scale: 1; --title-opacity: 1;
          --bridge-y: 0px; --bridge-bottom: 5vh;
          --bridge-width: 67.2vw; --bridge-scale: 1.02;
          --split-left-x: 0vw;  --split-left-y: 0px;  --split-left-scale: 1;
          --split-right-x: 0vw; --split-right-y: 0px; --split-right-scale: 1;
          --frame2-opacity: 0; --frame2-y: 0px; --frame2-scale: 1.06;
          --intro-copy-y: 0px; --intro-copy-opacity: 1;
          --panel2-opacity: 0; --panel2-y: 58px;
          --panel3-opacity: 0; --panel3-y: 58px;
          --tours-scene-opacity: 0; --tours-scene-y: 48px; --tours-scene-visibility: hidden;
          --ink: #111411; --paper: #fdf1e1; --shadow: rgba(0, 0, 0, 0.42);

          /* ── Shared color tokens — one palette, one opacity scale, used everywhere below ── */
          --c-bg: #0b1110;            /* page / section background */
          --c-bg-soft: #0f1c19;       /* pinned stage background */
          --c-accent: #10b981;        /* emerald accent — kickers, active states, links on hover */
          --c-accent-tint: rgba(16, 185, 129, 0.2); /* accent used as a soft fill */
          --c-star: #f59e0b;          /* rating star */
          --c-white: #ffffff;

          /* Cream text on dark, in one consistent opacity scale */
          --paper-strong: rgba(253, 241, 225, 0.90);  /* names, titles, primary copy */
          --paper-medium: rgba(253, 241, 225, 0.55);  /* meta text, secondary labels */
          --paper-soft: rgba(253, 241, 225, 0.45);    /* excerpts, tertiary labels */
          --paper-faint: rgba(253, 241, 225, 0.35);   /* empty-state copy */
          --paper-line: rgba(253, 241, 225, 0.10);    /* pill/cta idle fill */
          --paper-line-hover: rgba(253, 241, 225, 0.18); /* pill/cta hover fill */

          /* Dark glass surfaces for cards floating on photography */
          --surface: rgba(255, 255, 255, 0.05);
          --surface-on-photo: rgba(11, 17, 16, 0.82);
          --border: rgba(255, 255, 255, 0.09);
          --border-hover: rgba(255, 255, 255, 0.18);
          --img-overlay: rgba(11, 17, 16, 0.75);
          --badge-bg: rgba(0, 0, 0, 0.45);
          --on-photo-soft: rgba(255, 255, 255, 0.65); /* secondary text sitting on a badge/photo */

          /* Text shadows for copy sitting directly on photography */
          --text-shadow-heading: 0 16px 38px var(--shadow);
          --text-shadow-body: 0 2px 18px rgba(0, 0, 0, 0.6);
          --text-shadow-label: 0 2px 12px rgba(0, 0, 0, 0.5);

          /* Elevation shadows */
          --shadow-chip: 0 16px 34px rgba(0, 0, 0, 0.25);
          --shadow-card: 0 16px 40px rgba(0, 0, 0, 0.3);
        }

        .cinema-scroll {
          position: relative;
          height: calc(100vh + 2100px);
        }
        .stage {
          position: sticky;
          top: 0;
          height: 100vh;
          min-height: 620px;
          overflow: hidden;
          isolation: isolate;
          background: var(--c-bg-soft);
        }
        .world, .back-stack, .sky-img, .shade, .scene-img, .hero-title, .intro-copy, .story-panel, .tour-scene {
          position: absolute;
        }
        .world {
          inset: 0;
          overflow: hidden;
          background: var(--c-bg);
        }
        .scene-img {
          display: block;
          user-select: none;
          -webkit-user-drag: none;
          will-change: transform, opacity;
          pointer-events: none;
        }
        .sky-img {
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .back-stack {
          top: 0; bottom: 0; left: -3vw; right: -3vw;
          z-index: 1;
          transform: scale(var(--back-scale));
          transform-origin: 50% 100%;
          will-change: transform;
        }
        .back-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .back-bazaar, .back-four {
          top: auto;
          bottom: 0;
          left: 48%;
          right: auto;
          width: 112%;
          height: auto;
          object-fit: contain;
        }
        .back-bazaar {
          z-index: 3;
          opacity: 1;
          transform: translate3d(-50%, var(--bazaar-y), 0) scale(0.86);
        }
        .back-four {
          z-index: 1;
          opacity: 0.72;
          mix-blend-mode: screen;
          transform: translate3d(-50%, calc(var(--four-y) - 110px), 0) scale(var(--four-scale));
        }
        .hero-title {
          z-index: 3;
          left: 50%;
          top: clamp(122px, 19vh, 205px);
          width: min(94vw, 1780px);
          margin: 0;
          color: var(--paper);
          font-family: "Ogg Medium", Georgia, serif;
          font-size: clamp(4rem, 13vw, 14rem);
          font-weight: 500;
          line-height: 0.78;
          text-align: center;
          transform: translate3d(-50%, var(--title-y), 0) scale(var(--title-scale));
          opacity: var(--title-opacity);
          will-change: transform, opacity;
          letter-spacing: 0.04em;
          /* Without a shadow the wordmark sinks into the bright sky/mountain photo behind it —
             give it the same lift every other heading in this hero already gets. */
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), 0 20px 46px var(--shadow);
        }
        .bridge-img {
          z-index: 4;
          left: 50%;
          bottom: var(--bridge-bottom);
          width: min(var(--bridge-width), 2140px);
          height: auto;
          transform: translate3d(-50%, var(--bridge-y), 0) scale(var(--bridge-scale));
          transform-origin: 50% 48%;
        }
        .splitframe-img {
          z-index: 6;
          left: 50%;
          bottom: -2vh;
          width: min(118vw, 2240px);
          height: auto;
          pointer-events: none;
        }
        .splitframe-left {
          transform: translate3d(calc(-50% + var(--split-left-x)), var(--split-left-y), 0) scale(var(--split-left-scale));
          transform-origin: 21% 52%;
        }
        .splitframe-right {
          transform: translate3d(calc(-50% + var(--split-right-x)), var(--split-right-y), 0) scale(var(--split-right-scale));
          transform-origin: 79% 52%;
        }
        .frame-two-img {
          z-index: 5;
          left: 50%;
          top: 50%;
          width: min(122vw, 2160px);
          height: auto;
          opacity: var(--frame2-opacity);
          transform: translate3d(-50%, calc(-50% + var(--frame2-y)), 0) scale(var(--frame2-scale));
          transform-origin: 50% 48%;
        }
        .shade {
          inset: 0;
          z-index: var(--shade-z);
          pointer-events: none;
          background: linear-gradient(180deg,
            rgba(var(--blur-tint), var(--shade-top-alpha)) 0%,
            rgba(var(--blur-tint), var(--shade-mid-alpha)) 48%,
            rgba(var(--blur-tint), var(--shade-bottom-alpha)) 100%);
        }
        .intro-copy {
          z-index: 9;
          left: 50%;
          bottom: clamp(56px, 28vh, 400px);
          width: min(580px, calc(100vw - 40px));
          text-align: center;
          transform: translate3d(-50%, var(--intro-copy-y), 0);
          opacity: var(--intro-copy-opacity);
          will-change: transform, opacity;
        }
        .intro-copy p {
          margin: 0 auto;
          max-width: 560px;
          color: var(--paper);
          font-size: 1.18rem;
          font-weight: 500;
          line-height: 1.25;
          text-shadow: var(--text-shadow-body);
        }
        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 26px;
        }
        .hero-tags span {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          padding: 0 25px;
          color: var(--ink);
          border-radius: 999px;
          background: var(--paper);
          font-size: 0.98rem;
          font-weight: 600;
          box-shadow: var(--shadow-chip);
        }
        .story-panel {
          z-index: 10;
          left: 50%;
          top: 45%;
          width: min(760px, calc(100vw - 42px));
          text-align: center;
          pointer-events: none;
          transform: translate3d(-50%, -50%, 0);
          will-change: transform, opacity;
        }
        .story-panel h2 {
          margin: 0;
          color: var(--paper);
          /* Neither "Ogg Medium" nor the system "Georgia" fallback carry full Vietnamese
             tone-mark glyphs (ế, ố, ệ, ồ...) on every OS — the browser splits the base
             letter and the mark across two fonts mid-cluster. "Inter" is already loaded
             site-wide and is confirmed to render Vietnamese correctly, so Vietnamese
             headings use it directly instead of gambling on a serif fallback. */
          font-family: "Inter", sans-serif;
          font-size: clamp(2.5rem, 5.5vw, 4.75rem);
          font-weight: 500;
          line-height: 0.98;
          text-shadow: var(--text-shadow-heading);
        }
        .story-panel p {
          width: min(540px, 100%);
          margin: 26px auto 0;
          color: var(--paper);
          font-size: 1.14rem;
          font-weight: 500;
          line-height: 1.25;
          text-shadow: var(--text-shadow-body);
        }
        .story-panel-bridge {
          top: 60%;
          opacity: var(--panel2-opacity);
          transform: translate3d(-50%, calc(-50% + var(--panel2-y)), 0);
        }
        .story-panel-bazaar {
          top: 29%;
          opacity: var(--panel3-opacity);
          transform: translate3d(-50%, calc(-50% + var(--panel3-y)), 0);
        }
        .facts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 86px;
          width: min(470px, 100%);
          margin: 64px auto 0;
        }
        .facts dt {
          color: var(--paper);
          font-family: "Ogg Medium", Georgia, serif;
          font-size: clamp(2.8rem, 4.5vw, 4.2rem);
          font-weight: 500;
          line-height: 0.9;
          text-shadow: var(--text-shadow-heading);
        }
        .facts dd {
          margin: 14px 0 0;
          color: var(--paper);
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.18;
          text-shadow: var(--text-shadow-body);
        }
        .note-button {
          min-height: 50px;
          margin-top: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 28px;
          border-radius: 999px;
          color: var(--ink);
          background: var(--paper);
          box-shadow: var(--shadow-chip);
          pointer-events: auto;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .note-button:hover {
          transform: scale(1.05);
          background: var(--c-white);
        }

        /* Scene 4 — Tour showcase, takes over the pinned stage right after Scene 3 exits.
           No surrounding panel — only the cards themselves need to read clearly over the
           photo, so each card gets its own solid backdrop instead of one big box. */
        .tour-scene {
          z-index: 8;
          left: 50%;
          top: clamp(64px, 11vh, 130px);
          width: min(94vw, 1200px);
          transform: translate3d(-50%, var(--tours-scene-y), 0);
          opacity: var(--tours-scene-opacity);
          visibility: var(--tours-scene-visibility);
          pointer-events: auto;
          will-change: transform, opacity;
        }
        .tour-scene .journey-tours-header { margin-bottom: 20px; }
        .tour-scene .journey-tours-header h2 { text-shadow: var(--text-shadow-heading); }
        .tour-scene .journey-step-kicker { text-shadow: var(--text-shadow-label); }
        .tour-scene .journey-see-all { text-shadow: var(--text-shadow-label); }
        .tour-scene .journey-tours-grid { gap: 16px; }
        .tour-scene .journey-tour-card {
          background: var(--surface-on-photo);
          backdrop-filter: blur(8px);
          box-shadow: var(--shadow-card);
        }
        .tour-scene .journey-tour-img-wrap { height: 130px; }
        .tour-scene .journey-tour-body { padding: 14px; gap: 6px; }
        .tour-scene .journey-tour-name { font-size: 0.88rem; }
        .tour-scene .journey-tour-price { font-size: 0.98rem; }
        .tour-scene .journey-tour-skeleton { height: 240px; }

        /* Responsive Media Queries */
        @media (max-width: 1500px) {
          .hero-title { font-size: clamp(3.5rem, 11vw, 11rem); }
          .story-panel h2 { font-size: 4.1rem; }
        }

        @media (max-width: 1100px) {
          .hero-title { top: 15vh; font-size: 7.5rem; }
          .bridge-img { width: 138vw; }
          .frame-two-img { width: 132vw; }
          .story-panel h2 { font-size: 3.2rem; }
          .facts { gap: 34px; margin-top: 44px; }
          .facts dt { font-size: 3.2rem; }
        }

        @media (max-width: 640px) {
          .stage { min-height: 640px; }
          .site-header { grid-template-columns: 1fr auto; gap: 18px; padding: 24px; }
          .site-nav { grid-column: 1 / -1; grid-row: 2; justify-content: flex-start; gap: 18px; overflow-x: auto; }
          .hero-title { top: 16vh; font-size: 4.2rem; }
          .bridge-img { bottom: 2vh; width: 190vw; }
          .frame-two-img { width: 176vw; }
          .intro-copy { bottom: 42px; }
          .intro-copy p, .story-panel p { font-size: 1rem; }
          .hero-tags { gap: 8px; }
          .hero-tags span { min-height: 38px; padding: 0 16px; font-size: 0.88rem; }
          .story-panel { top: 42%; }
          .story-panel-bazaar { top: 26%; }
          .story-panel h2 { font-size: 2.45rem; }
          .facts { gap: 18px; margin-top: 34px; }
          .facts dt { font-size: 2.5rem; }
        }

        /* ── Journey continuation styling — reused by the in-hero tour scene and the stories chapter ── */
        .journey-step-kicker {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--c-accent);
          margin-bottom: 14px;
        }

        .journey-tours-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 40px;
        }
        .journey-tours-header h2 {
          /* Vietnamese heading — see .story-panel h2 for why it uses Inter, not a serif fallback */
          font-family: "Inter", sans-serif;
          font-size: clamp(1.9rem, 3vw, 2.6rem);
          font-weight: 500;
          color: var(--paper);
          margin: 8px 0 0;
        }
        .journey-see-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--paper-medium);
          text-decoration: none;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .journey-see-all:hover { color: var(--c-accent); }

        .journey-tours-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .journey-tour-skeleton {
          height: 400px;
          border-radius: 20px;
          background: var(--surface);
          animation: journeyPulse 1.5s ease-in-out infinite;
        }
        @keyframes journeyPulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        .journey-empty {
          text-align: center;
          padding: 48px;
          color: var(--paper-faint);
          font-size: 0.9rem;
        }
        .journey-tour-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s, border-color 0.25s;
        }
        .journey-tour-card:hover { transform: translateY(-4px); border-color: var(--border-hover); }
        .journey-tour-img-wrap { position: relative; height: 220px; overflow: hidden; flex-shrink: 0; }
        .journey-tour-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .journey-tour-card:hover .journey-tour-img { transform: scale(1.04); }
        .journey-tour-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 40%, var(--img-overlay) 100%);
          pointer-events: none;
        }
        .journey-tour-rating {
          position: absolute; bottom: 10px; right: 12px;
          display: flex; align-items: center; gap: 4px;
          background: var(--badge-bg); backdrop-filter: blur(6px);
          border-radius: 100px; padding: 4px 10px;
          font-size: 0.78rem; font-weight: 700; color: var(--c-white);
        }
        .journey-tour-star { width: 13px; height: 13px; flex-shrink: 0; }
        .journey-tour-review-count { font-weight: 400; color: var(--on-photo-soft); }
        .journey-story-views svg { color: var(--on-photo-soft); }
        .journey-tour-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .journey-tour-name {
          font-size: 0.95rem; font-weight: 700;
          color: var(--paper-strong);
          line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .journey-tour-name a { color: inherit; text-decoration: none; }
        .journey-tour-name a:hover { color: var(--c-accent); }
        .journey-tour-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; color: var(--paper-soft);
        }
        .journey-tour-dot { opacity: 0.4; }
        .journey-tour-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: auto; padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        .journey-tour-from { font-size: 0.72rem; color: var(--paper-soft); margin-bottom: 2px; }
        .journey-tour-price { font-size: 1.1rem; font-weight: 800; color: var(--c-accent); }
        .journey-tour-cta {
          display: inline-block;
          padding: 8px 18px; border-radius: 100px;
          font-size: 0.82rem; font-weight: 700;
          background: var(--paper-line); color: var(--paper-strong);
          text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .journey-tour-cta:hover { background: var(--paper-line-hover); color: var(--c-white); }

        /* ── Stories chapter — same dark palette, cards driven by the rAF/scroll engine above ── */
        .journey-stories-section {
          background: var(--c-bg);
          padding: 0 clamp(24px, 6vw, 96px) 120px;
          content-visibility: auto;
          contain-intrinsic-size: 1px 700px;
        }
        .journey-stories-inner { max-width: 1200px; margin: 0 auto; }
        .journey-stories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .journey-story-card {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.25s;
        }
        .journey-story-card.is-visible { opacity: 1; transform: translateY(0); }
        .journey-story-card:hover { border-color: var(--border-hover); }
        .journey-story-img-wrap { position: relative; height: 220px; overflow: hidden; flex-shrink: 0; }
        .journey-story-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .journey-story-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 40%, var(--img-overlay) 100%);
          pointer-events: none;
        }
        .journey-story-views {
          position: absolute; bottom: 10px; right: 12px;
          display: flex; align-items: center; gap: 4px;
          background: var(--badge-bg); backdrop-filter: blur(6px);
          border-radius: 100px; padding: 4px 10px;
          font-size: 0.78rem; font-weight: 700; color: var(--c-white);
        }
        .journey-story-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .journey-story-author {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; color: var(--paper-medium);
        }
        .journey-story-avatar { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .journey-story-avatar-fallback {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          background: var(--c-accent-tint); color: var(--c-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700;
        }
        .journey-story-name {
          font-size: 0.95rem; font-weight: 700;
          color: var(--paper-strong);
          line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .journey-story-name a { color: inherit; text-decoration: none; }
        .journey-story-name a:hover { color: var(--c-accent); }
        .journey-story-excerpt {
          font-size: 0.82rem; color: var(--paper-soft);
          line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .journey-story-cta {
          margin-top: auto;
          align-self: flex-start;
          display: inline-block;
          padding: 8px 18px; border-radius: 100px;
          font-size: 0.82rem; font-weight: 700;
          background: var(--paper-line); color: var(--paper-strong);
          text-decoration: none; transition: background 0.2s, color 0.2s;
        }
        .journey-story-cta:hover { background: var(--paper-line-hover); color: var(--c-white); }
        .journey-story-skeleton {
          height: 420px;
          border-radius: 20px;
          background: var(--surface);
          animation: journeyPulse 1.5s ease-in-out infinite;
        }

        @media (max-width: 1023px) {
          .journey-tours-grid { grid-template-columns: repeat(2, 1fr); }
          .journey-stories-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 639px) {
          .journey-tours-grid { grid-template-columns: 1fr; }
          .journey-stories-grid { grid-template-columns: 1fr; }
          .journey-stories-section { padding: 0 20px 80px; }
          .tour-scene { top: clamp(64px, 9vh, 96px); }
          .tour-scene .journey-tours-grid { gap: 12px; }
          .tour-scene .journey-tour-img-wrap { height: 96px; }
        }
      `}</style>

      <main className="site-shell">
        <section
          ref={sectionRef}
          id="cinema"
          className="cinema-scroll"
          aria-label="TrekSphere cinematic scroll story"
        >
          <div className="stage">
            <div className="world">
              {/* Sky Background Image */}
              <img className="scene-img sky-img" src={REMOTE_ASSETS.sky} alt="" />

              {/* Back Stack Glow Layers */}
              <div className="back-stack">
                <img className="scene-img back-img back-four" src={REMOTE_ASSETS.backFour} alt="" />
                <img className="scene-img back-img back-bazaar" src={REMOTE_ASSETS.bazaar} alt="" />
              </div>

              {/* Dynamic Tint Shade Overlay */}
              <div className="shade" />

              {/* Scene 1 Hero Title */}
              <h1 className="hero-title">TREKSPHERE</h1>

              {/* Parallax Splitframe & Foreground Layers */}
              <img
                className="scene-img splitframe-img splitframe-left"
                src={REMOTE_ASSETS.splitLeft}
                alt=""
              />
              <img
                className="scene-img splitframe-img splitframe-right"
                src={REMOTE_ASSETS.splitRight}
                alt=""
              />
              <img className="scene-img bridge-img" src={REMOTE_ASSETS.bridge} alt="" />
              <img className="scene-img frame-two-img" src={REMOTE_ASSETS.frameTwo} alt="" />
            </div>

            {/* Scene 1 Intro Overview */}
            <section className="intro-copy" aria-label="TrekSphere overview">
              <p>
                Những đỉnh núi hùng vĩ, biển mây bạt ngàn và cộng đồng phượt thủ đam mê đồng hành
                cùng bạn trên mọi nẻo đường thám hiểm.
              </p>
              <nav className="hero-tags" aria-label="TrekSphere highlights">
                <span>Đỉnh Fansipan</span>
                <span>Tà Xùa Sương Mù</span>
                <span>Cực Đông Tổ Quốc</span>
              </nav>
            </section>

            {/* Scene 2 Story Panel: Bridge & Mountain Crossing */}
            <section className="story-panel story-panel-bridge" aria-label="Old Bridge details">
              <h2>Mỗi cung đường là một hành trình kết nối.</h2>
              <p>
                TrekSphere gắn kết những trái tim yêu thiên nhiên, cùng chinh phục những tuyến đường
                huyền thoại băng qua núi rừng Việt Nam.
              </p>
              <dl className="facts">
                <div>
                  <dt>3.143m</dt>
                  <dd>Đỉnh Fansipan - Nóc nhà Đông Dương</dd>
                </div>
                <div>
                  <dt>100%</dt>
                  <dd>Xác thực CCCD & Hồ sơ ghép nhóm an toàn</dd>
                </div>
              </dl>
            </section>

            {/* Scene 3 Story Panel: Companion Community Hub */}
            <section className="story-panel story-panel-bazaar" aria-label="Old town details">
              <h2>Cộng đồng phượt thủ đồng điệu.</h2>
              <p>
                Tìm cạ cứng cùng thể lực, minh bạch dự toán chi phí và chia sẻ những khoảnh khắc vô
                giá dọc đường đi.
              </p>
              <button type="button" className="note-button" onClick={() => navigate('/groups')}>
                <span aria-hidden="true">↗</span>
                <span>Khám phá nhóm ghép ngay</span>
              </button>
            </section>

            {/* Scene 4: Tour showcase — takes over the pinned stage right after Scene 3 exits,
                replacing what used to be a separate slider/section below the fold. */}
            <section className="tour-scene" aria-labelledby="tour-scene-heading">
              <div className="journey-tours-header">
                <div>
                  <span className="journey-step-kicker">Bước tiếp theo</span>
                  <h2 id="tour-scene-heading">Tour nổi bật</h2>
                </div>
                <Link to={PATHS.TOURS} className="journey-see-all">
                  Xem tất cả
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {toursLoading ? (
                <div className="journey-tours-grid" aria-busy="true">
                  {['sk-t1', 'sk-t2', 'sk-t3'].map((id) => (
                    <div key={id} className="journey-tour-skeleton" aria-hidden="true" />
                  ))}
                </div>
              ) : tours.length === 0 ? (
                <p className="journey-empty">Chưa có tour nào được đánh giá.</p>
              ) : (
                <div className="journey-tours-grid">
                  {tours.slice(0, 3).map((tour: Tour) => (
                    <article key={tour.id} className="journey-tour-card">
                      <div className="journey-tour-img-wrap">
                        <img
                          src={tour.image || TOUR_IMAGE_FALLBACK}
                          alt={tour.name}
                          loading="lazy"
                          className="journey-tour-img"
                          onError={(e) => {
                            e.currentTarget.src = TOUR_IMAGE_FALLBACK;
                          }}
                        />
                        <div className="journey-tour-img-overlay" aria-hidden="true" />
                        <div className="journey-tour-rating">
                          <svg
                            className="journey-tour-star"
                            viewBox="0 0 24 24"
                            fill="var(--c-star)"
                            aria-hidden="true"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span>{tour.rating.toFixed(1)}</span>
                          <span className="journey-tour-review-count">({tour.reviewCount})</span>
                        </div>
                      </div>
                      <div className="journey-tour-body">
                        <h3 className="journey-tour-name">
                          <Link to={`${PATHS.TOURS}/${tour.id}`}>{tour.name}</Link>
                        </h3>
                        <div className="journey-tour-meta">
                          <span>{tour.duration}</span>
                          <span className="journey-tour-dot" aria-hidden="true">
                            ·
                          </span>
                          <span>{tour.level}</span>
                        </div>
                        <div className="journey-tour-footer">
                          <div>
                            <p className="journey-tour-from">Từ</p>
                            <p className="journey-tour-price">{tour.price}</p>
                          </div>
                          <Link to={`${PATHS.TOURS}/${tour.id}`} className="journey-tour-cta">
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* Stories chapter — reveals card-by-card via the same rAF-driven engine as the hero above */}
        <section className="journey-stories-section" aria-labelledby="journey-stories-heading">
          <div className="journey-stories-inner">
            <div className="journey-tours-header">
              <div>
                <span className="journey-step-kicker">Cảm hứng từ cộng đồng</span>
                <h2 id="journey-stories-heading">Câu chuyện hành trình</h2>
              </div>
              <Link to={PATHS.NEWS} className="journey-see-all">
                Xem tất cả bài viết
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {storiesLoading ? (
              <div className="journey-stories-grid" aria-busy="true">
                {['sk-s1', 'sk-s2', 'sk-s3'].map((id) => (
                  <div key={id} className="journey-story-skeleton" aria-hidden="true" />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <p className="journey-empty">Chưa có câu chuyện nào được chia sẻ.</p>
            ) : (
              <div className="journey-stories-grid">
                {stories.map((story, idx) => (
                  <article
                    key={story.blogId}
                    ref={(el) => {
                      if (el) storyCardsRef.current[idx] = el;
                    }}
                    className="journey-story-card"
                  >
                    <div className="journey-story-img-wrap">
                      <img
                        src={
                          story.coverImageUrl ??
                          'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80'
                        }
                        alt={story.title}
                        loading="lazy"
                        className="journey-story-img"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80';
                        }}
                      />
                      <div className="journey-story-img-overlay" aria-hidden="true" />
                      <div className="journey-story-views">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        <span>{story.viewCount ?? 0}</span>
                      </div>
                    </div>
                    <div className="journey-story-body">
                      <div className="journey-story-author">
                        {story.authorAvatarUrl ? (
                          <img
                            src={story.authorAvatarUrl}
                            alt={story.authorName}
                            className="journey-story-avatar"
                          />
                        ) : (
                          <div className="journey-story-avatar-fallback">
                            {story.authorName?.[0] ?? 'U'}
                          </div>
                        )}
                        <span>{story.authorName}</span>
                      </div>
                      <h3 className="journey-story-name">
                        <Link to={getNewsDetailPath(story.blogId)}>{story.title}</Link>
                      </h3>
                      <p className="journey-story-excerpt">{stripHtml(story.excerpt)}</p>
                      <Link to={getNewsDetailPath(story.blogId)} className="journey-story-cta">
                        Đọc thêm
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
