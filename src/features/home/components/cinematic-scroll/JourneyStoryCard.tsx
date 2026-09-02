import { Link } from 'react-router-dom';
import { getNewsDetailPath } from '@/constants';
import type { BlogListItem } from '@/features/news/types';
import { stripHtml } from '@/utils/sanitize';
import { STORY_IMAGE_FALLBACK } from '../../constants/cinematic-scroll';

interface JourneyStoryCardProps {
  story: BlogListItem;
}

/** 1 thẻ câu chuyện trong Scene 5 — tách khỏi StoriesScene để mỗi file chỉ làm một việc. */
export function JourneyStoryCard({ story }: JourneyStoryCardProps) {
  return (
    <article className="journey-story-card">
      <div className="journey-story-img-wrap">
        <img
          src={story.coverImageUrl ?? STORY_IMAGE_FALLBACK}
          alt={story.title}
          loading="lazy"
          className="journey-story-img"
          onError={(e) => {
            e.currentTarget.src = STORY_IMAGE_FALLBACK;
          }}
        />
        <div className="journey-story-img-overlay" aria-hidden="true" />
        <div className="journey-story-views">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
            <div className="journey-story-avatar-fallback">{story.authorName?.[0] ?? 'U'}</div>
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
  );
}
