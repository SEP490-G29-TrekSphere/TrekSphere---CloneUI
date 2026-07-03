import { Camera } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { UserProfile } from '@/features/auth';

interface ProfileSidebarProps {
  profile: UserProfile;
  /** Chế độ hiện tại: view hay edit. */
  mode?: 'view' | 'edit';
  /** Khi user bấm "Thay đổi ảnh" — handler nhận file vừa chọn. */
  onAvatarChange?: (file: File) => void;
  /** Đang upload avatar. */
  isUploadingAvatar?: boolean;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face';

const formatJoinedMonth = (iso?: string): string => {
  if (!iso) return 'Tháng 09/2025';
  try {
    const d = new Date(iso);
    return `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return 'Tháng 09/2025';
  }
};

/**
 * Cột trái của màn hình Profile — hiển thị avatar, tên, stats, nút hành động.
 * Dùng chung cho cả màn View và Edit để đảm bảo nhất quán layout 30%-70%.
 */
export default function ProfileSidebar({
  profile,
  mode = 'view',
  onAvatarChange,
  isUploadingAvatar = false,
}: ProfileSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
    // Reset value để chọn lại cùng 1 file vẫn trigger onChange
    e.target.value = '';
  };

  const avatarSrc = profile.avatar || DEFAULT_AVATAR;
  const stats = profile.stats ?? { toursCount: 5, postsCount: 12, followersCount: 1200 };
  const joinedText = formatJoinedMonth(profile.joinedAt);
  const username = profile.username || `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <aside className="flex w-full flex-col items-center rounded-3xl bg-card p-6 shadow-sm lg:sticky lg:top-6">
      {/* Avatar */}
      <div className="relative">
        <div
          className="h-[120px] w-[120px] overflow-hidden rounded-full ring-4 ring-muted"
          style={{ backgroundColor: 'var(--color-muted)' }}
        >
          <img
            src={avatarSrc}
            alt={profile.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {mode === 'edit' && (
          <>
            <button
              type="button"
              onClick={handleClickUpload}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2 inline-flex items-center gap-1.5 rounded-full border border-border bg-accent px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{isUploadingAvatar ? 'Đang tải lên...' : 'Thay đổi ảnh'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
          </>
        )}
      </div>

      {/* Name + username + joined date */}
      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold text-primary">{profile.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{username}</p>
        <p className="text-sm text-muted-foreground">Tham gia từ: {joinedText}</p>
      </div>

      {/* Divider */}
      <div className="my-6 h-px w-full bg-border" />

      {/* Stats */}
      <div className="grid w-full grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-base font-bold text-primary">{stats.toursCount}</p>
          <p className="text-xs text-muted-foreground">Tour đã đi</p>
        </div>
        <div className="border-x border-border">
          <p className="text-base font-bold text-primary">{stats.postsCount}</p>
          <p className="text-xs text-muted-foreground">Bài viết</p>
        </div>
        <div>
          <p className="text-base font-bold text-primary">
            {stats.followersCount >= 1000
              ? `${(stats.followersCount / 1000).toFixed(1)}K`
              : stats.followersCount}
          </p>
          <p className="text-xs text-muted-foreground">Người theo dõi</p>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-6 w-full">
        {mode === 'view' ? (
          <Link
            to={PATHS.EDIT_PROFILE}
            className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Chỉnh sửa hồ sơ
          </Link>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Đang chỉnh sửa hồ sơ. Thay đổi sẽ chỉ được lưu khi bạn bấm{' '}
            <span className="font-semibold text-primary">"Lưu thay đổi"</span>.
          </p>
        )}
      </div>
    </aside>
  );
}
