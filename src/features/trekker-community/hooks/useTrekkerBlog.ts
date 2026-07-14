import { useQuery } from '@tanstack/react-query';
import { getMockBlogList, MOCK_STATS } from '../data/mockBlogs';
import type { TrekkerBlogListParams, TrekkerBlogListResponse, TrekkerBlogStats } from '../types';

/** Query key factory cho trekker community. */
export const trekkerBlogKeys = {
  all: ['trekker-blog'] as const,
  lists: () => [...trekkerBlogKeys.all, 'list'] as const,
  list: (params: TrekkerBlogListParams) => [...trekkerBlogKeys.lists(), params] as const,
  stats: () => [...trekkerBlogKeys.all, 'stats'] as const,
};

/**
 * Hook lấy danh sách blog của Trekker hiện tại (phân trang).
 * Hiện dùng mock data — thay bằng API thực khi BE cung cấp.
 */
export function useTrekkerBlogList(params: TrekkerBlogListParams) {
  return useQuery<TrekkerBlogListResponse, Error>({
    queryKey: trekkerBlogKeys.list(params),
    queryFn: () => getMockBlogList(params),
  });
}

/**
 * Hook lấy thống kê tổng quan blog của Trekker.
 * Hiện dùng mock data — thay bằng API thực khi BE cung cấp.
 */
export function useTrekkerBlogStats() {
  return useQuery<TrekkerBlogStats, Error>({
    queryKey: trekkerBlogKeys.stats(),
    queryFn: async () => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_STATS;
    },
    staleTime: 1000 * 60 * 2,
  });
}
