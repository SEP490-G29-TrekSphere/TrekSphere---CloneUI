import { useQuery } from '@tanstack/react-query';
import { trekkerBlogService } from '../services/trekkerBlogService';
import type { TrekkerBlogListParams, TrekkerBlogListResponse } from '../types';

/** Query key factory cho feature Blog. */
export const trekkerBlogKeys = {
  all: ['trekker-blog'] as const,
  lists: () => [...trekkerBlogKeys.all, 'list'] as const,
  list: (params: TrekkerBlogListParams) => [...trekkerBlogKeys.lists(), params] as const,
  details: () => [...trekkerBlogKeys.all, 'detail'] as const,
  detail: (blogId: string) => [...trekkerBlogKeys.details(), blogId] as const,
};

/** Hook lấy danh sách blog (phân trang). Truyền `authorId` để lọc theo tác giả. */
export function useTrekkerBlogList(params: TrekkerBlogListParams, options?: { enabled?: boolean }) {
  return useQuery<TrekkerBlogListResponse, Error>({
    queryKey: trekkerBlogKeys.list(params),
    queryFn: () => trekkerBlogService.getBlogs(params),
    enabled: options?.enabled,
  });
}

/** Hook lấy chi tiết 1 bài viết — dùng để load dữ liệu cho màn Sửa. */
export function useTrekkerBlogDetail(blogId: string | undefined) {
  return useQuery({
    queryKey: trekkerBlogKeys.detail(blogId ?? ''),
    queryFn: () => trekkerBlogService.getBlogDetail(blogId as string),
    enabled: Boolean(blogId),
  });
}
