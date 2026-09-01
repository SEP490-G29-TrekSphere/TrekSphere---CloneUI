import { type RefObject, useEffect, useRef } from 'react';
import {
  CINEMATIC_ASSETS,
  SCROLL_TIMELINE,
  SKIP_INTRO_SCROLL_TARGET,
} from '../constants/cinematic-scroll';

/**
 * Engine cuộn cinematic cho trang chủ — mọi giá trị animation (parallax, fade,
 * scale...) là hàm thuần của vị trí cuộn, ghi thẳng vào CSS custom property trên
 * phần tử `.cinema-scroll` qua `sectionRef`. Không dùng React state cho từng frame:
 * chỉ 1 cờ rAF-batch, không mouse-tracking, không lerp/easing chồng thêm — một khi
 * sự kiện scroll dừng thì không còn gì tiếp tục animate.
 *
 * - Tôn trọng `prefers-reduced-motion`: `motionScale` (0/1) triệt tiêu mọi
 *   translate/scale nhưng KHÔNG đụng vào opacity/visibility — nội dung vẫn hiện/ẩn
 *   theo scroll, chỉ là không còn xê dịch/phóng to trên màn hình.
 * - Preload font hiển thị (Ogg Medium) vì đây là chữ đầu tiên user nhìn thấy khi
 *   vào trang, không nên phải cạnh tranh băng thông với các ảnh scene.
 *
 * @param sectionRef Ref của `<section className="cinema-scroll">` — nơi mọi CSS
 * var được ghi vào, các scene con chỉ cần đọc `var(--x)` trong CSS, không cần
 * nhận animation value qua props.
 */
export function useCinematicScrollEngine(sectionRef: RefObject<HTMLElement | null>) {
  const rafPendingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = CINEMATIC_ASSETS.fontOgg;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;

    function clamp(v: number, min = 0, max = 1) {
      return Math.min(max, Math.max(min, v));
    }
    function smoothstep(e0: number, e1: number, v: number) {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    }

    function getScrollDistance() {
      if (!sectionEl) return 0;
      const rect = sectionEl.getBoundingClientRect();
      return clamp(-rect.top, 0, sectionEl.offsetHeight - window.innerHeight);
    }

    // Vòng lặp animation chính — mọi giá trị là hàm thuần của vị trí cuộn, mỗi
    // rAF tick chỉ đọc layout 1 lần rồi ghi 1 loạt style, không có gì tiếp tục
    // animate sau khi sự kiện scroll dừng.
    function update() {
      rafPendingRef.current = false;
      if (!sectionEl) return;

      const scroll = getScrollDistance();
      // 0 khi reduced-motion — triệt tiêu mọi số hạng parallax translate/scale bên
      // dưới, còn công thức opacity/visibility (không phụ thuộc biến này) vẫn giữ
      // nguyên để nội dung tiếp tục hiện/ẩn theo scroll.
      const motionScale = reducedMotionRef.current ? 0 : 1;

      const progress = clamp(scroll / SCROLL_TIMELINE.PROGRESS_RANGE);
      const introExit = smoothstep(...SCROLL_TIMELINE.INTRO_EXIT, scroll);

      // Story panel 1 (Frame 2)
      const frame2Enter = smoothstep(...SCROLL_TIMELINE.FRAME2_ENTER, scroll);
      const frame2Exit = smoothstep(...SCROLL_TIMELINE.FRAME2_EXIT, scroll);
      const panel2Opacity = frame2Enter * (1 - frame2Exit);

      // Story panel 2 (Frame 3)
      const frame3Enter = smoothstep(...SCROLL_TIMELINE.FRAME3_ENTER, scroll);
      const frame3Exit = smoothstep(...SCROLL_TIMELINE.FRAME3_EXIT, scroll);
      const panel3Opacity = frame3Enter * (1 - frame3Exit);

      // Tour scene (Scene 4): tiếp quản ngay sau khi Scene 3 rời đi, rồi bàn giao
      // lại cho Scene 5.
      const toursSceneEnter = smoothstep(...SCROLL_TIMELINE.TOURS_ENTER, scroll);
      const toursSceneExit = smoothstep(...SCROLL_TIMELINE.TOURS_EXIT, scroll);
      const toursSceneOpacity = toursSceneEnter * (1 - toursSceneExit);

      // Stories scene (Scene 5): mờ dần vào khi tour scene mờ dần ra, rồi giữ
      // nguyên full-screen tới hết quãng cuộn, giống hệt Scene 4.
      const storiesSceneEnter = smoothstep(...SCROLL_TIMELINE.STORIES_ENTER, scroll);

      const shadeActive = clamp(
        panel2Opacity + panel3Opacity + toursSceneOpacity * 0.55 + storiesSceneEnter * 0.55
      );

      // Nền Frame 2 (núi) được fade sẵn ở mức 0.35 và giữ nguyên 1.0 xuyên suốt
      // đoạn cuộn giữa, tránh mọi khoảng đen.
      const frame2Opacity = Math.max(0.35, frame2Enter);
      const splitDrift = smoothstep(...SCROLL_TIMELINE.SPLIT_DRIFT, scroll) ** 1.3;

      const backScale =
        0.76 + motionScale * (progress * 0.2 + frame2Enter * 0.18 + frame3Enter * 0.16);
      const sharedHeroY = motionScale * progress * -74;
      const sharedHeroScale = motionScale * progress * 0.23;
      // Cầu (bridge) trước đây "lớn dần" bằng cách animate `width` — 1 property
      // kích hoạt layout, phải tính lại mỗi frame cuộn, chính là nguyên nhân giật
      // còn sót lại. Giờ ảnh cố định ở kích thước lớn nhất, "lớn dần" hoàn toàn
      // bằng `transform: scale()` với transform-origin ở đáy — compositor-only,
      // không còn layout.
      const bridgeSizeFrac = (67.2 + motionScale * frame2Enter * 37.8) / 105;

      const style = sectionEl.style;
      style.setProperty('--back-scale', backScale.toFixed(4));
      style.setProperty('--four-y', `${(10 + motionScale * progress * 10).toFixed(2)}vh`);
      style.setProperty('--four-scale', (0.78 + motionScale * progress * 0.16).toFixed(4));
      style.setProperty('--bazaar-y', `${(20 - motionScale * progress * 8).toFixed(2)}vh`);

      style.setProperty('--shade-z', shadeActive > 0.02 ? '2' : '0');
      style.setProperty('--shade-top-alpha', (shadeActive * 0.2).toFixed(4));
      style.setProperty('--shade-mid-alpha', (shadeActive * 0.15).toFixed(4));
      style.setProperty('--shade-bottom-alpha', (shadeActive * 0.25).toFixed(4));

      style.setProperty('--title-y', `${(motionScale * introExit * -210).toFixed(2)}px`);
      style.setProperty('--title-scale', (1 - motionScale * introExit * 0.08).toFixed(4));
      style.setProperty('--title-opacity', (1 - introExit).toFixed(4));

      style.setProperty(
        '--bridge-y',
        `${(sharedHeroY - motionScale * frame2Exit * 760).toFixed(2)}px`
      );
      style.setProperty('--bridge-bottom', `${(5 - motionScale * frame2Enter * 13).toFixed(2)}vh`);
      style.setProperty(
        '--bridge-scale',
        ((1.02 + sharedHeroScale + motionScale * frame2Exit * 0.46) * bridgeSizeFrac).toFixed(4)
      );

      style.setProperty('--split-left-x', `${(-motionScale * splitDrift * 46).toFixed(2)}vw`);
      style.setProperty(
        '--split-left-y',
        `${(sharedHeroY - motionScale * splitDrift * 180).toFixed(2)}px`
      );
      style.setProperty(
        '--split-left-scale',
        (1 + sharedHeroScale + motionScale * frame2Enter * 0.74).toFixed(4)
      );

      style.setProperty('--split-right-x', `${(motionScale * splitDrift * 46).toFixed(2)}vw`);
      style.setProperty(
        '--split-right-y',
        `${(sharedHeroY - motionScale * splitDrift * 180).toFixed(2)}px`
      );
      style.setProperty(
        '--split-right-scale',
        (1 + sharedHeroScale + motionScale * frame2Enter * 0.74).toFixed(4)
      );

      style.setProperty('--frame2-opacity', frame2Opacity.toFixed(4));
      style.setProperty('--frame2-y', `${(-motionScale * frame2Exit * 150).toFixed(2)}px`);
      style.setProperty(
        '--frame2-scale',
        (1.06 + motionScale * (frame2Enter * 0.08 + frame2Exit * 0.08)).toFixed(4)
      );

      style.setProperty('--intro-copy-y', `${(motionScale * introExit * 90).toFixed(2)}px`);
      style.setProperty('--intro-copy-opacity', (1 - introExit).toFixed(4));
      style.setProperty('--intro-copy-visibility', introExit < 1 ? 'visible' : 'hidden');

      style.setProperty('--panel2-opacity', panel2Opacity.toFixed(4));
      style.setProperty(
        '--panel2-y',
        `${(motionScale * (-frame2Exit * 86 + (1 - frame2Enter) * 58)).toFixed(2)}px`
      );
      style.setProperty('--panel2-visibility', panel2Opacity > 0.02 ? 'visible' : 'hidden');

      style.setProperty('--panel3-opacity', panel3Opacity.toFixed(4));
      style.setProperty(
        '--panel3-y',
        `${(motionScale * (-frame3Exit * 86 + (1 - frame3Enter) * 58)).toFixed(2)}px`
      );
      style.setProperty('--panel3-visibility', panel3Opacity > 0.02 ? 'visible' : 'hidden');

      style.setProperty('--tours-scene-opacity', toursSceneOpacity.toFixed(4));
      style.setProperty(
        '--tours-scene-y',
        `${(motionScale * (1 - toursSceneEnter) * 48).toFixed(2)}px`
      );
      style.setProperty(
        '--tours-scene-visibility',
        toursSceneOpacity > 0.02 ? 'visible' : 'hidden'
      );

      style.setProperty('--stories-scene-opacity', storiesSceneEnter.toFixed(4));
      style.setProperty(
        '--stories-scene-y',
        `${(motionScale * (1 - storiesSceneEnter) * 48).toFixed(2)}px`
      );
      style.setProperty(
        '--stories-scene-visibility',
        storiesSceneEnter > 0.02 ? 'visible' : 'hidden'
      );

      // Nút "Bỏ qua giới thiệu": hiện xuyên suốt scene 1-3, mờ dần khi Scene 4 tiếp quản.
      const skipOpacity = clamp(1 - toursSceneEnter * 2);
      style.setProperty('--skip-opacity', skipOpacity.toFixed(4));
      style.setProperty('--skip-visibility', skipOpacity > 0.02 ? 'visible' : 'hidden');
    }

    function requestTick() {
      if (!rafPendingRef.current) {
        rafPendingRef.current = true;
        requestAnimationFrame(update);
      }
    }

    function handleScroll() {
      requestTick();
    }

    function handleResize() {
      requestTick();
    }

    function handleMotionPreferenceChange(e: MediaQueryListEvent) {
      reducedMotionRef.current = e.matches;
      requestTick();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    motionQuery.addEventListener('change', handleMotionPreferenceChange);

    requestTick();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionPreferenceChange);
    };
  }, [sectionRef]);

  // Nhảy thẳng tới lúc Scene 4 (tour) đã hiện đầy đủ — người dùng quay lại
  // trang không phải cuộn lại toàn bộ phần giới thiệu cinematic.
  function handleSkipIntro() {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;
    const targetTop = sectionEl.offsetTop + SKIP_INTRO_SCROLL_TARGET;
    window.scrollTo({
      top: targetTop,
      behavior: reducedMotionRef.current ? 'auto' : 'smooth',
    });
  }

  return { handleSkipIntro };
}
