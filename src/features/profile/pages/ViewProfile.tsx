import { useQuery } from '@tanstack/react-query';
import { PATHS } from '@/constants';
import { AppSpinner } from '@/shared/ui';
import ProfileSidebar from '../components/ProfileSidebar';
import { profileService } from '../services/profileService';
import { GENDER_LABELS } from '../types';

// Dữ liệu mẫu dùng khi BE chưa sẵn sàng — fallback nếu API trả về rỗng.
const MOCK_PROFILE = {
  id: 'user-001',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  phone: '0912 345 678',
  avatar: '',
  username: '@vanna_trek',
  gender: 'male' as const,
  dateOfBirth: '1998-05-15',
  address: 'Hà Nội, Việt Nam',
  bio: 'Đam mê trekking, leo núi và khám phá những cung đường mới lạ tại Việt Nam. Đang hướng tới mục tiêu chinh phục trọn vẹn các đỉnh núi cao trên 3000m tại Tây Bắc.',
  interests: ['Trekking', 'Leo núi', 'Cắm trại', 'Chụp ảnh thiên nhiên', 'Khám phá văn hóa'],
  stats: { toursCount: 5, postsCount: 12, followersCount: 1200 },
  joinedAt: '2025-09-01T00:00:00Z',
  role: 'trekker' as const,
};

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
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileService.getProfile(),
    // Nếu BE chưa sẵn sàng, fallback sang mock để dev tiếp tục làm UI.
    placeholderData: { data: MOCK_PROFILE, status: 200 },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  const profile = response?.data ?? MOCK_PROFILE;

  const displayGender = profile.gender ? GENDER_LABELS[profile.gender] : '—';
  const displayDob = profile.dateOfBirth || '—';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
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
              <InfoCell label="Địa chỉ" value={profile.address} />
            </div>
          </section>

          {/* Phần 2: Tiểu sử */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-primary">Tiểu sử / Giới thiệu</h2>
            <p className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-primary">
              {profile.bio || '—'}
            </p>
          </section>

          {/* Phần 3: Sở thích */}
          <section className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-primary">Sở thích</h2>
            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa cập nhật sở thích.</p>
            )}
          </section>

          {isError && (
            <p className="text-center text-xs text-muted-foreground">
              * Đang hiển thị dữ liệu mẫu. Backend sẽ sớm được kết nối.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Re-export PATHS cho các module khác import luôn nếu cần
export { PATHS };
