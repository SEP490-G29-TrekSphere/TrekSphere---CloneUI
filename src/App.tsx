import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import AppRoutes from './routes/AppRoutes';
import { AppGlobalLoadingSpinner, AppGlobalToast } from './shared/ui';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <AppGlobalLoadingSpinner />
      <AppGlobalToast />
    </QueryClientProvider>
  );
}
