import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogList } from '@/features/news/hooks/useBlog';
import { useFeaturedTours } from '@/features/tours/hooks/useFeaturedTours';
import { toast } from '@/store/useToastStore';
import { useCinematicScrollEngine } from '../../hooks/useCinematicScrollEngine';
import '../../styles/cinematic-scroll.css';
import { HeroScene } from './HeroScene';
import { SceneProgressTimeline } from './SceneProgressTimeline';
import { SkipIntroButton } from './SkipIntroButton';
import { StoriesScene } from './StoriesScene';
import { StoryPanel } from './StoryPanel';
import { TourScene } from './TourScene';

/**
 * Trải nghiệm cuộn cinematic của trang chủ — 5 scene pin trong cùng 1 màn hình
 * (`.cinema-scroll`), chuyển tiếp bằng fade/parallax theo vị trí cuộn. File này
 * chỉ là orchestrator: fetch data (Smart) rồi compose các scene con (Dumb) —
 * toàn bộ animation nằm trong `useCinematicScrollEngine`, style nằm trong
 * `cinematic-scroll.css`.
 */
export default function CinematicScrollLanding() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);

  const { tours, isLoading: toursLoading } = useFeaturedTours();
  const {
    data: blogData,
    isLoading: storiesLoading,
    error: storiesError,
  } = useBlogList({
    page: 1,
    size: 3,
    sortBy: 'viewCount',
    sortDir: 'desc',
  });
  const stories = blogData?.items ?? [];

  useEffect(() => {
    if (storiesError) {
      toast.error('Không tải được câu chuyện hành trình, vui lòng thử lại sau.');
    }
  }, [storiesError]);

  const { handleSkipIntro } = useCinematicScrollEngine(sectionRef);

  return (
    <div className="relative w-full bg-[var(--c-bg)] text-[var(--paper)]">
      <main className="site-shell">
        <section
          ref={sectionRef}
          id="cinema"
          className="cinema-scroll"
          aria-label="TrekSphere cinematic scroll story"
        >
          <div className="stage">
            <HeroScene />

            <SkipIntroButton onSkip={handleSkipIntro} />

            <SceneProgressTimeline />

            <StoryPanel variant="bridge" ariaLabel="Old Bridge details">
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
            </StoryPanel>

            <StoryPanel variant="bazaar" ariaLabel="Old town details">
              <h2>Cộng đồng phượt thủ đồng điệu.</h2>
              <p>
                Tìm cạ cứng cùng thể lực, minh bạch dự toán chi phí và chia sẻ những khoảnh khắc vô
                giá dọc đường đi.
              </p>
              <button type="button" className="note-button" onClick={() => navigate('/groups')}>
                <span aria-hidden="true">↗</span>
                <span>Khám phá nhóm ghép ngay</span>
              </button>
            </StoryPanel>

            <TourScene tours={tours} isLoading={toursLoading} />

            <StoriesScene stories={stories} isLoading={storiesLoading} />
          </div>
        </section>
      </main>
    </div>
  );
}
