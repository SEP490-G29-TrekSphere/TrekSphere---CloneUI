import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { BlogListItem } from '@/features/news/types';
import { JourneyStoryCard } from './JourneyStoryCard';

interface StoriesSceneProps {
  stories: BlogListItem[];
  isLoading: boolean;
}

const SKELETON_IDS = ['sk-s1', 'sk-s2', 'sk-s3'];

/**
 * Scene 5 — "Câu chuyện hành trình", tiếp quản màn hình pin ngay sau khi Scene 4
 * rời đi, cùng cơ chế pinned full-screen như mọi scene trước. Component "dumb":
 * chỉ nhận `stories`/`isLoading` đã fetch sẵn từ orchestrator (`useBlogList`).
 */
export function StoriesScene({ stories, isLoading }: StoriesSceneProps) {
  return (
    <section className="pinned-scene stories-scene" aria-labelledby="journey-stories-heading">
      <div className="journey-tours-header">
        <h2 id="journey-stories-heading">Câu chuyện hành trình</h2>
        <p className="journey-tours-subtitle">
          Lắng nghe nhật ký hành trình và trải nghiệm thám hiểm chân thực từ các trekker
        </p>
        <Link to={PATHS.NEWS} className="journey-see-all">
          Xem tất cả bài viết
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="journey-stories-grid" aria-busy="true">
          {SKELETON_IDS.map((id) => (
            <div key={id} className="journey-story-skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <p className="journey-empty">
          Chưa có câu chuyện nào được chia sẻ. <Link to={PATHS.NEWS}>Xem tất cả bài viết →</Link>
        </p>
      ) : (
        <div className="journey-stories-grid">
          {stories.map((story) => (
            <JourneyStoryCard key={story.blogId} story={story} />
          ))}
        </div>
      )}
    </section>
  );
}
