/**
 * Types cho feature Trekker Community / "Blog của tôi".
 * Khớp trực tiếp với BlogSummaryResponse / BlogDetailResponse của BE (Blog API).
 */

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'DELETED';

/** Một bài viết trong danh sách blog (~ BlogSummaryResponse). */
export interface TrekkerBlogItem {
  blogId: string;
  title: string;
  coverImageUrl: string | null;
  status: BlogStatus;
  viewCount: number;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  totalComments: number;
  createdAt: string; // ISO date string
}

/** Chi tiết đầy đủ của 1 bài viết (~ BlogDetailResponse), dùng cho màn Sửa. */
export interface TrekkerBlogDetail extends TrekkerBlogItem {
  content: string;
  updatedAt: string;
}

/** Pagination meta (chuẩn Spring Data Page<T>). */
export interface TrekkerBlogMeta {
  pageNumber: number; // 1-based (đã convert từ 0-based của BE)
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/** Response envelope cho list endpoint. */
export interface TrekkerBlogListResponse {
  items: TrekkerBlogItem[];
  meta: TrekkerBlogMeta;
}

/** Tham số query cho list endpoint (GET /blogs). */
export interface TrekkerBlogListParams {
  authorId?: string;
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Payload tạo bài viết mới (~ CreateBlogRequest).
 *
 * `POST /blogs` nhận `multipart/form-data`: `title`/`content` bind qua
 * `@ModelAttribute`, ảnh bìa là FILE THẬT ở part `coverImage` — BE tự upload
 * rồi trả `coverImageUrl` trong response. FE KHÔNG upload trước rồi gửi URL.
 */
export interface CreateBlogPayload {
  title: string;
  content: string;
  coverImage?: File;
}

/** Payload cập nhật bài viết (~ UpdateBlogRequest) — cũng là multipart/form-data. */
export interface UpdateBlogPayload {
  title?: string;
  content?: string;
  coverImage?: File;
}
