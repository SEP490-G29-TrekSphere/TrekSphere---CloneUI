import { type ApiResponse, ApiService, ApiUpload } from '@/config/apiClient';
import type {
  CreateBlogPayload,
  TrekkerBlogDetail,
  TrekkerBlogItem,
  TrekkerBlogListParams,
  TrekkerBlogListResponse,
  UpdateBlogPayload,
} from '../types';

/**
 * Service gọi API cho feature Blog (Trekker & Vendor Staff dùng chung để tạo/sửa bài viết
 * của chính mình; Admin cũng tái sử dụng `toggleBlogVisibility`/`deleteBlog` để kiểm duyệt).
 *
 * Endpoints (BE thật):
 *   GET    /blogs?authorId=&keyword=&page=&size=&sortBy=&sortDir=
 *   GET    /blogs/{id}
 *   POST   /blogs        — multipart/form-data
 *   PUT    /blogs/{id}   — multipart/form-data
 *   PUT    /blogs/{id}/hide   — không có body, BE tự toggle PUBLISHED <-> HIDDEN theo status hiện tại
 *   DELETE /blogs/{id}
 */

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Dựng body `multipart/form-data` cho POST/PUT `/blogs`.
 *
 * BE khai báo `consumes = MULTIPART_FORM_DATA_VALUE` nên nếu gửi object JSON
 * thì Spring chặn ngay ở tầng content negotiation
 * (`HttpMediaTypeNotSupportedException`), không bao giờ vào tới controller.
 *
 * Ảnh bìa gửi thẳng file qua part `coverImage` — KHÔNG upload trước qua
 * `/files/upload` rồi gửi URL, vì BE không có trường nào nhận URL.
 */
function buildBlogFormData(payload: CreateBlogPayload | UpdateBlogPayload): FormData {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.content !== undefined) formData.append('content', payload.content);
  if (payload.coverImage) formData.append('coverImage', payload.coverImage);
  return formData;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ.');
  }
  return response.data;
}

export const trekkerBlogService = {
  /** Lấy danh sách blog (phân trang). Truyền `authorId` để lọc blog của 1 tác giả. */
  async getBlogs(params: TrekkerBlogListParams = {}): Promise<TrekkerBlogListResponse> {
    const query: Record<string, string> = {};
    if (params.authorId) query.authorId = params.authorId;
    if (params.keyword?.trim()) query.keyword = params.keyword.trim();
    query.page = String((params.page ?? 1) - 1); // BE Spring Data 0-indexed
    query.size = String(params.size ?? 10);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDir) query.sortDir = params.sortDir;

    const response = await ApiService<PaginationResponseDto<TrekkerBlogItem>>(
      '/blogs',
      'GET',
      undefined,
      query
    );
    const data = unwrapResponse(response);

    return {
      items: data.content,
      meta: {
        pageNumber: data.pageNumber + 1,
        pageSize: data.pageSize,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      },
    };
  },

  /**
   * Lấy chi tiết 1 bài viết (dùng để load dữ liệu cho màn Sửa).
   * Lưu ý: endpoint này public và tăng `viewCount` mỗi lần gọi — kể cả khi
   * chính tác giả mở trang Sửa. BE không có endpoint riêng để tránh side-effect
   * này, đây là giới hạn đã biết và được chấp nhận.
   */
  async getBlogDetail(blogId: string): Promise<TrekkerBlogDetail> {
    const response = await ApiService<TrekkerBlogDetail>(`/blogs/${blogId}`, 'GET');
    return unwrapResponse(response);
  },

  /** Tạo bài viết mới — đăng ngay ở trạng thái PUBLISHED. */
  async createBlog(payload: CreateBlogPayload): Promise<TrekkerBlogDetail> {
    const response = await ApiUpload<TrekkerBlogDetail>(
      '/blogs',
      buildBlogFormData(payload),
      'POST'
    );
    return unwrapResponse(response);
  },

  /** Cập nhật bài viết (chỉ chủ bài viết). */
  async updateBlog(blogId: string, payload: UpdateBlogPayload): Promise<TrekkerBlogDetail> {
    const response = await ApiUpload<TrekkerBlogDetail>(
      `/blogs/${blogId}`,
      buildBlogFormData(payload),
      'PUT'
    );
    return unwrapResponse(response);
  },

  /**
   * Ẩn/Hiện bài viết — gọi chung 1 endpoint, BE tự toggle status hiện tại
   * (PUBLISHED <-> HIDDEN). Response không trả về blog đã cập nhật nên caller
   * cần refetch (invalidate query) để lấy status mới.
   */
  async toggleBlogVisibility(blogId: string): Promise<void> {
    const response = await ApiService<void>(`/blogs/${blogId}/hide`, 'PUT');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  /** Xóa vĩnh viễn bài viết (chủ bài viết hoặc Admin). */
  async deleteBlog(blogId: string): Promise<void> {
    const response = await ApiService<void>(`/blogs/${blogId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
