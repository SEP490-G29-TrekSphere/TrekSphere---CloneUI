import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppButton, AppSpinner } from '@/shared/ui';
import { storage } from '@/utils/storage';
import ProfileSidebar from '../components/ProfileSidebar';
import { useProfile } from '../hooks/useProfile';
import { GENDER_LABELS } from '../types';

interface InfoCellProps {
  label: string;
  value?: string;
}

function InfoCell({ label, value }: InfoCellProps) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-primary">{value || '—'}</p>
    </div>
  );
}

/**
 * Màn hình 1: Xem hồ sơ cá nhân.
 * - Cột trái (30%): Sidebar thẻ cá nhân (avatar, tên, stats, nút chỉnh sửa).
 * - Cột phải (70%): Thông tin chi tiết, tiểu sử, sở thích.
 * - Responsive: dưới lg sẽ xếp chồng 1 cột dọc.
 */
export default function ViewProfile() {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const errorMessage = error instanceof Error ? error.message : null;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
        <div>
          <AppButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 px-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </AppButton>
        </div>
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-primary md:text-3xl">Hồ sơ của tôi</h1>
          <p className="text-sm text-muted-foreground">Xem và quản lý thông tin cá nhân của bạn</p>
        </header>
        <div className="space-y-4 rounded-2xl bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">
            {errorMessage || 'Không thể tải hồ sơ. Vui lòng đăng nhập hoặc thử lại sau.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <AppButton
              type="button"
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                void refetch();
              }}
            >
              Thử lại
            </AppButton>
            {!storage.get<string>('accessToken') && (
              <AppButton type="button" onClick={() => (window.location.href = PATHS.LOGIN)}>
                Đăng nhập lại
              </AppButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayGender = profile?.gender ? GENDER_LABELS[profile.gender] : '—';
  const displayDob = profile?.dateOfBirth || '—';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      <div>
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </AppButton>
      </div>

      {/* Page title */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">Hồ sơ của tôi</h1>
        <p className="text-sm text-muted-foreground">Xem và quản lý thông tin cá nhân của bạn</p>
      </header>

      {/* 2-column layout: sidebar (30%) + main (70%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <ProfileSidebar profile={profile} mode="view" />
        </div>

        {/* Main content */}
        <div className="space-y-6 lg:col-span-7">
          {/* Phần 1: Thông tin cá nhân */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-primary">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCell label="Họ và tên" value={profile.name} />
              <InfoCell label="Số điện thoại" value={profile.phone} />
              <InfoCell label="Email" value={profile.email} />
              <InfoCell label="Ngày sinh" value={displayDob} />
              <InfoCell label="Giới tính" value={displayGender} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Re-export PATHS cho các module khác import luôn nếu cần
export { PATHS };
