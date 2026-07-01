import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './shared/hooks';
import { AppGlobalLoadingSpinner, AppGlobalToast } from './shared/ui';

export default function App() {
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
