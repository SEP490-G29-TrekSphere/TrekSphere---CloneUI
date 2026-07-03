/**
 * Types riêng cho feature News/Blog.
 * Chỉ chứa entity BlogPost, BlogComment, BlogCategory.
 * Service payload đặt ở services/blogService.ts.
 */

export type BlogCategoryId = 'all' | 'experience' | 'review' | 'equipment' | 'guide';

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
}

/**
 * Một khối nội dung bên trong bài viết.
 * Hỗ trợ: paragraph (p), heading (h2), image, blockquote, list.
 */
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'list'; items: string[] };

export interface BlogAuthor {
  name: string;
  avatar: string;
  bio?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  categoryId: Exclude<BlogCategoryId, 'all'>;
  categoryLabel: string;
  author: BlogAuthor;
  publishedAt: string; // ISO date
  readingTime: number; // minutes
  tags: string[];
  blocks: BlogBlock[];
  /** Bài viết liên quan — hiển thị trong sidebar. */
  relatedSlugs?: string[];
}

export interface BlogComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  postedAgoLabel: string; // ví dụ: "2 giờ trước"
  replies?: BlogComment[];
}
