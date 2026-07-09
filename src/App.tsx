import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './shared/hooks';
import { AppGlobalLoadingSpinner, AppGlobalToast } from './shared/ui';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const _hasHydrated = useAppStore((state) => state._hasHydrated);

  // Chờ Zustand hydrate xong từ localStorage trước khi render
  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppRoutes />
        <AppGlobalLoadingSpinner />
        <AppGlobalToast />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
