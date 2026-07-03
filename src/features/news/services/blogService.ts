import { DEFAULT_COMMENTS } from '../data/blogComments';
import { BLOG_POSTS } from '../data/blogPosts';
import type { BlogComment, BlogPost } from '../types';

/**
 * Service xử lý dữ liệu blog.
 * Hiện tại dùng mock data; khi BE sẵn sàng sẽ thay bằng ApiService.
 */
export const blogService = {
  /** Lấy danh sách bài viết (không phân trang trong mock). */
  async getPosts(): Promise<BlogPost[]> {
    return BLOG_POSTS;
  },

  /** Lấy chi tiết bài viết theo slug. */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
  },

  /** Lấy danh sách bài viết liên quan theo slug của bài hiện tại. */
  async getRelated(slug: string): Promise<BlogPost[]> {
    const current = BLOG_POSTS.find((p) => p.slug === slug);
    if (!current?.relatedSlugs) return [];
    return BLOG_POSTS.filter((p) => current.relatedSlugs?.includes(p.slug));
  },

  /** Lấy comment theo slug bài viết (hiện trả về chung 1 danh sách). */
  async getCommentsBySlug(_slug: string): Promise<BlogComment[]> {
    return DEFAULT_COMMENTS;
  },
};
