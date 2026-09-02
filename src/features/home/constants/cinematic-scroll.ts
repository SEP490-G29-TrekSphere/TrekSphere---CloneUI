/**
 * Hằng số dùng chung cho toàn bộ trải nghiệm cuộn cinematic của trang chủ
 * (`CinematicScrollLanding` và các scene con trong thư mục này).
 */

export const CINEMATIC_ASSETS = {
  fontOgg: '/cinematic/OggText-Medium.woff2',
  // .webp — cùng ảnh gốc re-encode từ PNG 4K ban đầu (~2-8MB mỗi ảnh, việc decode
  // từng ấy texture 4K full-screen mỗi frame cuộn là nguyên nhân chính gây giật).
  // WebP giảm tổng dung lượng từ ~33MB xuống ~2.5MB.
  sky: '/cinematic/sky.webp',
  backFour: '/cinematic/backFour.webp',
  bazaar: '/cinematic/bazaar.webp',
  splitLeft: '/cinematic/splitLeft.webp',
  splitRight: '/cinematic/splitRight.webp',
  bridge: '/cinematic/bridge.webp',
  frameTwo: '/cinematic/frameTwo.webp',
} as const;

export const TOUR_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

export const STORY_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80';

/**
 * Mốc quãng đường cuộn (px, tính từ lúc `.cinema-scroll` bắt đầu pin) cho từng
 * scene — mỗi cặp [start, end] là khoảng smoothstep dùng trong
 * `useCinematicScrollEngine`. Gom về một chỗ để khi cần chỉnh nhịp cuộn (thêm/bớt
 * scene, đổi tốc độ) chỉ sửa đúng 1 nơi, tránh rải số cứng qua nhiều file.
 */
export const SCROLL_TIMELINE = {
  /** Tổng quãng cuộn thêm sau `100vh` — quyết định `.cinema-scroll` cao bao nhiêu. */
  TOTAL_EXTRA_SCROLL: 2900,
  /** Mốc parallax nền (backScale/four-y/bazaar-y/hero zoom) đạt giá trị tối đa. */
  PROGRESS_RANGE: 2100,
  INTRO_EXIT: [40, 300],
  FRAME2_ENTER: [40, 260],
  FRAME2_EXIT: [720, 920],
  FRAME3_ENTER: [820, 1020],
  FRAME3_EXIT: [1320, 1520],
  TOURS_ENTER: [1300, 1560],
  TOURS_EXIT: [2020, 2260],
  STORIES_ENTER: [2020, 2320],
  SPLIT_DRIFT: [40, 340],
} as const;

/**
 * "Bỏ qua giới thiệu" nhảy thẳng tới lúc Scene 4 (tour) đã hiện đầy đủ — dùng
 * chung điểm cuối của `TOURS_ENTER` thay vì lặp lại số 1560 ở một nơi khác.
 */
export const SKIP_INTRO_SCROLL_TARGET = SCROLL_TIMELINE.TOURS_ENTER[1];
