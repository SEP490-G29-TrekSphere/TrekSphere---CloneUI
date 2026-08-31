import CinematicScrollLanding from '@/features/home/components/CinematicScrollLanding';

/**
 * Home — landing page cho guest (không cần đăng nhập).
 * Trang này thuộc feature 'public/home' (khách vãng lai).
 *
 * Header/Footer được render bởi PublicLayout ở routes/AppRoutes.
 * Toàn bộ nội dung (hero cinematic, ghép nhóm, tour nổi bật, câu chuyện hành trình)
 * nằm trong CinematicScrollLanding, dùng chung 1 engine rAF/scroll layer-parallax
 * — không còn tách thành các component với hệ hiệu ứng khác nhau (gsap ScrollTrigger, v.v.).
 */
export default function Home() {
  return <CinematicScrollLanding />;
}
