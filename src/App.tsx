import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryClient } from './config/queryClient';
import { profileService } from './features/profile/services/profileService';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './shared/hooks';
import { AppGlobalLoadingSpinner, AppGlobalToast } from './shared/ui';
import { useAppStore } from './store/useAppStore';
import { storage } from './utils/storage';

export default function App() {
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    const token = storage.get<string>('accessToken');
    if (!token) return;
    profileService.getProfile().then((res) => {
      if (!res.data) return;
      const profile = res.data;
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar,
        roles: profile.role ? [profile.role] : [],
      });
    });
  }, [setUser]);

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
