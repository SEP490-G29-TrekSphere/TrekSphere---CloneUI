import { ApiService } from '@/config/apiClient';
import type {
  BlogCommentItem,
  BlogCommentListMeta,
  BlogListItem,
  BlogListMeta,
  BlogListParams,
  BlogPostDetail,
  CreateBlogCommentPayload,
} from '../types';

/**
 * Service gọi API cho feature News/Blog.
 *
 * Endpoints (bám theo spec BE):
 *   GET    /api/v1/blogs?keyword=&page=&size=&sortBy=&sortDir=
 *         → { success, code, message, data: { content, pageNumber, pageSize, totalElements, totalPages, ... }, timestamp }
 *   GET    /api/v1/blogs/{id}
 *         → { success, code, message, data: BlogPostDetail (id, title, content, coverImageUrl, comments, ...) }
 *   GET    /api/v1/blogs/{id}/comments?page=&size=
 *         → { success, code, message, data: { content: BlogComment[], ...meta }, timestamp }
 *   POST   /api/v1/blogs/{id}/comments (auth)
 *         body: { content, parentCommentId? }
 *         → { success, code, message, data: BlogComment }
 *
 * Vì `ApiService` đã unwrap 1 cấp envelope (success/data),
 * `res.data` chính là phần `data` của envelope BE.
 *   - List:      res.data = { content: BlogItem[], pageNumber, pageSize, totalElements, totalPages, ... }
 *   - Detail:    res.data = BlogPostDetail
 *   - Comments:  res.data = { content: BlogComment[], pageNumber, ... }
 */
export const blogService = {
  /**
   * Lấy danh sách bài viết phân trang.
   * Lưu ý: BE chỉ hỗ trợ filter `keyword` + sort `sortBy/sortDir` —
   * không có filter category.
   */
  async getPosts(
    params: BlogListParams = {}
  ): Promise<{ items: BlogListItem[]; meta: BlogListMeta }> {
    const query = new URLSearchParams();
    if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
    if (params.page) query.set('page', String(params.page - 1)); // BE Spring Data dùng 0-indexed
    if (params.size) query.set('size', String(params.size));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortDir) query.set('sortDir', params.sortDir);

    const qs = query.toString();
    const res = await ApiService<{
      content: BlogListItem[];
      pageNumber: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    }>(`/blogs${qs ? `?${qs}` : ''}`, 'GET');

    if (res.error) {
      throw new Error(res.error);
    }

    const data = res.data;
    return {
      items: data?.content ?? [],
      meta: {
        pageNumber: (data?.pageNumber ?? params.page ?? 1) + 1, // BE trả 0-indexed → convert sang 1-indexed
        pageSize: data?.pageSize ?? params.size ?? 10,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
      },
    };
  },

  /**
   * Lấy chi tiết bài viết theo `id` (UUID/string — KHÔNG phải slug).
   * BE: GET /api/v1/blogs/{id} → trả về BlogPostDetail.
   */
  async getPostById(id: string): Promise<BlogPostDetail | null> {
    const res = await ApiService<BlogPostDetail>(`/blogs/${id}`, 'GET');
    if (res.error) {
      if (res.status === 404) return null;
      throw new Error(res.error);
    }
    return res.data ?? null;
  },

  /**
   * Lấy comments của bài viết (phân trang).
   * BE: GET /api/v1/blogs/{id}/comments?page=&size=
   */
  async getCommentsById(
    id: string,
    params: { page?: number; size?: number } = {}
  ): Promise<{ items: BlogCommentItem[]; meta: BlogCommentListMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page - 1)); // BE Spring Data dùng 0-indexed
    if (params.size) query.set('size', String(params.size));
    const qs = query.toString();
    const res = await ApiService<{
      content: BlogCommentItem[];
      pageNumber: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    }>(`/blogs/${id}/comments${qs ? `?${qs}` : ''}`, 'GET');

    if (res.error) {
      throw new Error(res.error);
    }

    const data = res.data;
    return {
      items: data?.content ?? [],
      meta: {
        pageNumber: (data?.pageNumber ?? params.page ?? 1) + 1, // BE trả 0-indexed → convert sang 1-indexed
        pageSize: data?.pageSize ?? params.size ?? 10,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
      },
    };
  },

  /**
   * Tạo comment mới cho bài viết (cần auth — Bearer token tự gắn qua interceptor).
   * BE: POST /api/v1/blogs/{id}/comments
   *      body: { content, parentCommentId? }
   */
  async createComment(blogId: string, payload: CreateBlogCommentPayload): Promise<BlogCommentItem> {
    const res = await ApiService<BlogCommentItem>(`/blogs/${blogId}/comments`, 'POST', payload);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Không nhận được phản hồi từ máy chủ.');
    }
    return res.data;
  },
};
