import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // staleTime mặc định = 0: data luôn stale sau fetch,
      // invalidateQueries sẽ trigger refetch ngay lập tức.
      // Hooks cần cache lâu (tours, news, profile...) đặt staleTime riêng.
    },
  },
});
