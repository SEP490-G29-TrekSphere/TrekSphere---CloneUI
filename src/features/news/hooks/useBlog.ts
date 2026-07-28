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
  UpdateBlogCommentPayload,
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
 *
 * Dùng `topLevelOnly: true` — mỗi bình luận gốc trả về kèm cây `replies` lồng nhau,
 * nên không cần phân trang riêng cho reply. `size` lấy lớn để tránh phải làm UI
 * phân trang comment (ngoài phạm vi hiện tại).
 *
 * Lưu ý: KHÔNG dùng `GET /blogs/{id}` (blog detail) làm nguồn comment vì endpoint đó
 * tăng viewCount mỗi lần gọi — refetch sau mỗi thao tác comment sẽ làm tăng view ảo.
 */
export function useBlogComments(blogId: string | undefined) {
  return useQuery<{ items: BlogCommentItem[]; meta: BlogCommentListMeta }>({
    queryKey: blogKeys.comments(blogId ?? ''),
    queryFn: () => blogService.getCommentsById(blogId as string, { topLevelOnly: true, size: 50 }),
    enabled: Boolean(blogId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook tạo comment mới hoặc trả lời (kèm `parentCommentId`).
 * - Yêu cầu user đã đăng nhập (BE check accessToken).
 * - Chỉ invalidate cache comments (KHÔNG đụng blog detail — tránh tăng viewCount ảo).
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
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
      }
    },
  });
}

/**
 * Hook sửa nội dung comment (chỉ chủ comment — kiểm tra ở UI, BE cũng enforce).
 */
export function useUpdateBlogComment(blogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateBlogCommentPayload;
    }) => blogService.updateComment(commentId, payload),
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
      }
    },
  });
}

/**
 * Hook xóa comment (chỉ chủ comment — kiểm tra ở UI, BE cũng enforce).
 */
export function useDeleteBlogComment(blogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => blogService.deleteComment(commentId),
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
      }
    },
  });
}
