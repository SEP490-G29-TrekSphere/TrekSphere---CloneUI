import { ApiService } from '@/config/apiClient';
import type {
  TrekkerBlogItem,
  TrekkerBlogListParams,
  TrekkerBlogListResponse,
  TrekkerBlogStats,
} from '../types';

/**
 * Service gọi API cho feature Trekker Community / "Blog của tôi".
 *
 * Endpoints (mock/giả định — cần confirm với BE):
 *   GET  /api/v1/blogs/my-blogs?keyword=&page=&size=&sortBy=&sortDir=&status=
 *         → { success, code, message, data: { content, pageNumber, pageSize, totalElements, totalPages }, timestamp }
 *   GET  /api/v1/blogs/my-blogs/stats
 *         → { success, code, message, data: TrekkerBlogStats }, timestamp }
 *   POST /api/v1/blogs
 *         → { success, code, message, data: TrekkerBlogItem }, timestamp }
 *   PUT  /api/v1/blogs/{id}
 *         → { success, code, message, data: TrekkerBlogItem }, timestamp }
 *   DELETE /api/v1/blogs/{id}
 *         → { success, code, message, data: null }, timestamp }
 *
 * Vì `ApiService` đã unwrap 1 cấp envelope (success/data),
 * `res.data` chính là phần `data` của envelope BE.
 */
export const trekkerBlogService = {
  /**
   * Lấy danh sách blog của Trekker hiện tại (phân trang).
   */
  async getMyBlogs(params: TrekkerBlogListParams = {}): Promise<TrekkerBlogListResponse> {
    const query = new URLSearchParams();
    if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
    if (params.page) query.set('page', String(params.page - 1)); // BE Spring Data 0-indexed
    if (params.size) query.set('size', String(params.size));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortDir) query.set('sortDir', params.sortDir);
    if (params.status) query.set('status', params.status);

    const qs = query.toString();
    const res = await ApiService<{
      content: TrekkerBlogItem[];
      pageNumber: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    }>(`/blogs/my-blogs${qs ? `?${qs}` : ''}`, 'GET');

    if (res.error) {
      throw new Error(res.error);
    }

    const data = res.data;
    return {
      items: data?.content ?? [],
      meta: {
        pageNumber: (data?.pageNumber ?? params.page ?? 1) + 1,
        pageSize: data?.pageSize ?? params.size ?? 10,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
      },
    };
  },

  /**
   * Lấy thống kê tổng quan blog của Trekker.
   */
  async getMyBlogStats(): Promise<TrekkerBlogStats> {
    const res = await ApiService<TrekkerBlogStats>('/blogs/my-blogs/stats', 'GET');
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data ?? { totalPosts: 0, totalViews: 0, newComments: 0 };
  },

  /**
   * Tạo bài viết mới.
   */
  async createBlog(payload: {
    title: string;
    content: string;
    coverImageUrl?: string;
    tags?: string[];
  }): Promise<TrekkerBlogItem> {
    const res = await ApiService<TrekkerBlogItem>('/blogs', 'POST', payload);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Không nhận được phản hồi từ máy chủ.');
    }
    return res.data;
  },

  /**
   * Cập nhật bài viết.
   */
  async updateBlog(
    blogId: string,
    payload: {
      title?: string;
      content?: string;
      coverImageUrl?: string;
      tags?: string;
      status?: string;
    }
  ): Promise<TrekkerBlogItem> {
    const res = await ApiService<TrekkerBlogItem>(`/blogs/${blogId}`, 'PUT', payload);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Không nhận được phản hồi từ máy chủ.');
    }
    return res.data;
  },

  /**
   * Xóa bài viết.
   */
  async deleteBlog(blogId: string): Promise<void> {
    const res = await ApiService<null>(`/blogs/${blogId}`, 'DELETE');
    if (res.error) {
      throw new Error(res.error);
    }
  },

  /**
   * Ẩn/Hiện bài viết (chuyển trạng thái sang DRAFT hoặc PUBLISHED).
   */
  async toggleBlogVisibility(blogId: string, isHidden: boolean): Promise<TrekkerBlogItem> {
    const payload = { status: isHidden ? 'DRAFT' : 'PUBLISHED' };
    const res = await ApiService<TrekkerBlogItem>(`/blogs/${blogId}`, 'PUT', payload);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Không nhận được phản hồi từ máy chủ.');
    }
    return res.data;
  },
};
