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
 * Các mốc vị trí dừng (px) chuẩn xác và ĐỒNG ĐỀU (bước cuộn = 650px) cho 5 Scene.
 */
export const SCENE_TARGETS = [0, 650, 1300, 1950, 2600] as const;

/**
 * Mốc quãng đường cuộn (px, tính từ lúc `.cinema-scroll` bắt đầu pin) cho từng
 * scene — mỗi cặp [start, end] là khoảng smoothstep dùng trong
 * `useCinematicScrollEngine`. Gom về một chỗ để khi cần chỉnh nhịp cuộn chỉ sửa đúng 1 nơi.
 */
export const SCROLL_TIMELINE = {
  /** Tổng quãng cuộn thêm sau `100vh` — quyết định `.cinema-scroll` cao bao nhiêu. */
  TOTAL_EXTRA_SCROLL: 2600,
  /** Mốc parallax nền (backScale/four-y/bazaar-y/hero zoom) đạt giá trị tối đa. */
  PROGRESS_RANGE: 2600,
  INTRO_EXIT: [0, 500],
  FRAME2_ENTER: [150, 650],
  FRAME2_EXIT: [650, 1150],
  FRAME3_ENTER: [800, 1300],
  FRAME3_EXIT: [1300, 1800],
  TOURS_ENTER: [1450, 1950],
  TOURS_EXIT: [1950, 2200],
  STORIES_ENTER: [2200, 2550],
  SPLIT_DRIFT: [0, 650],
} as const;

/**
 * "Bỏ qua giới thiệu" nhảy thẳng tới lúc Scene 4 (tour) đã hiện đầy đủ.
 */
export const SKIP_INTRO_SCROLL_TARGET = SCENE_TARGETS[3];
