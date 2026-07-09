/**
 * Types riêng cho feature News/Blog.
 * Bám theo response BE thực tế:
 *   GET /api/v1/blogs?keyword=&page=&size=&sortBy=&sortDir=
 *     → { success, code, message, data: { content: BlogItem[], pageNumber, pageSize,
 *                                         totalElements, totalPages, ... }, timestamp }
 *   GET /api/v1/blogs/{id}
 *     → { success, code, message, data: BlogPostDetail (id, title, content, coverImageUrl,
 *                                                       comments (nested), tags, ...) }
 *   GET /api/v1/blogs/{id}/comments?page=&size=
 *     → { success, code, message, data: { content: BlogComment[], ...meta }, timestamp }
 *   POST /api/v1/blogs/{id}/comments  (auth)
 *     body: { content, parentCommentId? }
 *     → { success, code, message, data: BlogComment }
 *
 * Lưu ý: BE dùng `id` (UUID/string), KHÔNG có `slug`.
 *       BE unwrap 1 cấp: `ApiService<T>` đã trả `res.data` = phần `data` bên trong envelope.
 *       → Service đọc thẳng `res.data.content`, `res.data.pageNumber`...
 */

/** Một bài viết trong list endpoint. */
export interface BlogListItem {
  blogId: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  /** Tên category do BE trả về (string). */
  categoryName?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  publishedAt: string; // ISO
  readingTimeMinutes: number;
  tags: string[];
  viewCount: number;
}

/** Một bài viết trong detail endpoint — mở rộng từ list item. */
export interface BlogPostDetail extends BlogListItem {
  /** Nội dung bài viết — BE trả về markdown/string thuần. */
  content: string;
  /** BE trả về nested tree (replies). */
  comments: BlogCommentItem[];
  totalComments: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  createdAt: string;
  updatedAt: string;
}

/** Một comment — BE có thể trả nested tree. */
export interface BlogCommentItem {
  id: string;
  blogId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string;
  content: string;
  createdAt: string;
  parentCommentId: string | null;
  replies?: BlogCommentItem[];
}

/** Pagination meta (chuẩn Spring Data `Page<T>`). */
export interface BlogListMeta {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/** Pagination meta cho comments (cũng theo Spring Data). */
export interface BlogCommentListMeta extends BlogListMeta {}

/** Payload khi tạo comment mới. */
export interface CreateBlogCommentPayload {
  content: string;
  parentCommentId?: string | null;
}

/** Tham số query cho list endpoint — bám đúng param BE hỗ trợ. */
export interface BlogListParams {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Backward-compatible alias cho code cũ (giữ để tránh phải sửa nhiều chỗ ngoài feature).
 * Code mới nên dùng `BlogListItem` / `BlogPostDetail` / `BlogCommentItem`.
 */
export interface BlogPost extends BlogListItem {}

export interface BlogComment extends BlogCommentItem {}

export type BlogCategoryId = 'all' | 'experience' | 'review' | 'equipment' | 'guide';

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
}

/** Helper: flatten nested comments → danh sách phẳng để render. */
export function flattenComments(comments: BlogCommentItem[]): BlogCommentItem[] {
  const flat: BlogCommentItem[] = [];
  for (const c of comments) {
    flat.push(c);
    if (c.replies?.length) {
      flat.push(...flattenComments(c.replies));
    }
  }
  return flat;
}
