/**
 * Types cho feature Trekker Community / "Blog của tôi".
 * Màn hình quản lý blog của một Trekker đã đăng nhập.
 */

export type BlogStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

/** Một bài viết trong danh sách blog của Trekker. */
export interface TrekkerBlogItem {
  blogId: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  status: BlogStatus;
  viewCount: number;
  commentCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  publishedAt: string | null; // ISO date string, null nếu chưa publish
  tags: string[];
  readingTimeMinutes: number;
}

/** Pagination meta (chuẩn Spring Data Page<T>). */
export interface TrekkerBlogMeta {
  pageNumber: number; // 1-based
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/** Response envelope cho list endpoint. */
export interface TrekkerBlogListResponse {
  items: TrekkerBlogItem[];
  meta: TrekkerBlogMeta;
}

/** Tham số query cho list endpoint. */
export interface TrekkerBlogListParams {
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  status?: BlogStatus;
}

/** Thống kê tổng quan của Trekker (tổng bài, tổng view, bình luận mới). */
export interface TrekkerBlogStats {
  totalPosts: number;
  totalViews: number;
  newComments: number;
}
