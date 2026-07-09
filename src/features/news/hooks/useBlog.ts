import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
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
 * Query keys dùng chung cho blog feature.
 * Centralized để tránh typo và dễ invalidate.
 *
 * Identifier chính của blog là `blogId` (UUID từ BE).
 */
export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: BlogListParams) => [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (blogId: string) => [...blogKeys.details(), blogId] as const,
  comments: (blogId: string) => [...blogKeys.detail(blogId), 'comments'] as const,
};

/**
 * Hook lấy danh sách bài viết phân trang.
 * Khi params (keyword/page/size/sortBy/sortDir) đổi sẽ tự refetch.
 */
export function useBlogList(params: BlogListParams) {
  return useQuery<{ items: BlogListItem[]; meta: BlogListMeta }>({
    queryKey: blogKeys.list(params),
    queryFn: () => blogService.getPosts(params),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook lấy chi tiết bài viết theo `blogId`.
 * Trả về BlogPostDetail (content, coverImageUrl, comments tree, tags, ...).
 */
export function useBlogDetail(blogId: string | undefined) {
  return useQuery<BlogPostDetail | null>({
    queryKey: blogKeys.detail(blogId ?? ''),
    queryFn: () => blogService.getPostById(blogId as string),
    enabled: Boolean(blogId),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook lấy danh sách "bài viết liên quan" hiển thị sidebar.
 *
 * BE hiện KHÔNG trả `related_blogs` trong detail response → tạm thời
 * reuse list endpoint (cùng sort dir) làm "gợi ý" cho sidebar.
 * Khi BE bổ sung endpoint `/blogs/{blogId}/related` thì chỉ cần thay service.
 */
export function useBlogRelated(currentBlogId: string | undefined) {
  return useQuery<BlogListItem[]>({
    queryKey: [...blogKeys.all, 'related', currentBlogId ?? ''] as const,
    queryFn: async () => {
      const { items } = await blogService.getPosts({
        page: 1,
        size: 6,
        sortBy: 'blogId',
        sortDir: 'desc',
      });
      return items.filter((p) => p.blogId !== currentBlogId).slice(0, 4);
    },
    enabled: Boolean(currentBlogId),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook lấy comments của bài viết (gọi endpoint riêng `/blogs/{blogId}/comments`).
 */
export function useBlogComments(blogId: string | undefined) {
  return useQuery<{ items: BlogCommentItem[]; meta: BlogCommentListMeta }>({
    queryKey: blogKeys.comments(blogId ?? ''),
    queryFn: () => blogService.getCommentsById(blogId as string),
    enabled: Boolean(blogId),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook tạo comment mới.
 * - Yêu cầu user đã đăng nhập (BE check accessToken).
 * - Sau khi tạo thành công: invalidate cache comments + detail để auto-refetch.
 */
export function useCreateBlogComment(blogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBlogCommentPayload) => {
      if (!blogId) {
        return Promise.reject(new Error('Thiếu blog blogId — không thể gửi bình luận.'));
      }
      return blogService.createComment(blogId, payload);
    },
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ queryKey: blogKeys.detail(blogId) });
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
      }
    },
  });
}
