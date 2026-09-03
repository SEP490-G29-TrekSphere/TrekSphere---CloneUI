import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { Tour } from '@/features/tours/types';
import { JourneyTourCard } from './JourneyTourCard';

interface TourSceneProps {
  tours: Tour[];
  isLoading: boolean;
}

const SKELETON_IDS = ['sk-t1', 'sk-t2', 'sk-t3'];

/**
 * Scene 4 — tiếp quản màn hình pin ngay sau khi Scene 3 rời đi, thay cho 1
 * slider/section riêng từng nằm dưới fold. Component "dumb": chỉ nhận
 * `tours`/`isLoading` đã fetch sẵn từ orchestrator (`useFeaturedTours`), không tự
 * gọi API.
 */
export function TourScene({ tours, isLoading }: TourSceneProps) {
  return (
    <section className="pinned-scene tour-scene" aria-labelledby="tour-scene-heading">
      <div className="journey-tours-header">
        <h2 id="tour-scene-heading">Tour nổi bật</h2>
        <p className="journey-tours-subtitle">
          Khám phá những cung đường chinh phục ấn tượng nhất do cộng đồng phượt thủ bình chọn
        </p>
        <Link to={PATHS.TOURS} className="journey-see-all">
          Xem tất cả tour
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="journey-tours-grid" aria-busy="true">
          {SKELETON_IDS.map((id) => (
            <div key={id} className="journey-tour-skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <p className="journey-empty">
          Chưa có tour nào được đánh giá. <Link to={PATHS.TOURS}>Xem tất cả tour →</Link>
        </p>
      ) : (
        <div className="journey-tours-grid">
          {tours.slice(0, 3).map((tour) => (
            <JourneyTourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </section>
  );
}
