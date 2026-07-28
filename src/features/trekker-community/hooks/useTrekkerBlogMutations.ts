import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trekkerBlogService } from '../services/trekkerBlogService';
import type { UpdateBlogPayload } from '../types';
import { trekkerBlogKeys } from './useTrekkerBlog';

/** Mutations cho feature Blog (tạo/sửa/ẩn-hiện/xóa) — dùng chung Trekker & Vendor Staff. */
export function useTrekkerBlogMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: trekkerBlogKeys.lists() });
  };

  const createBlog = useMutation({
    mutationFn: trekkerBlogService.createBlog,
    onSuccess: invalidateLists,
  });

  const updateBlog = useMutation({
    mutationFn: ({ blogId, payload }: { blogId: string; payload: UpdateBlogPayload }) =>
      trekkerBlogService.updateBlog(blogId, payload),
    onSuccess: (_data, variables) => {
      invalidateLists();
      queryClient.invalidateQueries({ queryKey: trekkerBlogKeys.detail(variables.blogId) });
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: (blogId: string) => trekkerBlogService.toggleBlogVisibility(blogId),
    onSuccess: invalidateLists,
  });

  const deleteBlog = useMutation({
    mutationFn: (blogId: string) => trekkerBlogService.deleteBlog(blogId),
    onSuccess: invalidateLists,
  });

  return { createBlog, updateBlog, toggleVisibility, deleteBlog };
}
