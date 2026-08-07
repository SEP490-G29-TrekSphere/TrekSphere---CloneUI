import { Camera } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { UserProfile } from '@/features/auth';

interface ProfileSidebarProps {
  profile: UserProfile;
  /** Chế độ hiện tại: view hay edit. */
  mode?: 'view' | 'edit';
  /** Override đường dẫn trang edit (mặc định PATHS.EDIT_PROFILE). */
  editPath?: string;
  /** Khi user bấm "Thay đổi ảnh" — handler nhận file vừa chọn. */
  onAvatarChange?: (file: File) => void;
}

/**
 * Cột trái của màn hình Profile — hiển thị avatar, tên, email, nút hành động.
 * Dùng chung cho cả màn View và Edit để đảm bảo nhất quán layout 30%-70%.
 *
 * Chỉ render dữ liệu `GET /users/me` thật sự trả về (`UserProfileResponse`:
 * fullName, email, phone, dateOfBirth, gender, avatarUrl, roles). BE không có
 * username, ngày tham gia hay số liệu tour/bài viết/người theo dõi — trước đây
 * các mục đó hiển thị bằng số liệu bịa, nay đã bỏ hẳn thay vì hiện sai.
 */
export default function ProfileSidebar({
  profile,
  mode = 'view',
  editPath,
  onAvatarChange,
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

  const avatarSrc = profile.avatar;
  const initial = profile.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <aside className="flex w-full flex-col items-center rounded-3xl bg-card p-6 shadow-sm lg:sticky lg:top-6">
      {/* Avatar */}
      <div className="relative">
        <div
          className="group relative h-[120px] w-[120px] overflow-hidden rounded-full ring-4 ring-muted"
          style={{ backgroundColor: 'var(--color-muted)' }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={profile.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            // Chưa có ảnh đại diện → hiện chữ cái đầu của tên, không dùng ảnh
            // stock của người lạ làm mặc định.
            <span className="flex h-full w-full items-center justify-center bg-primary text-4xl font-bold text-primary-foreground">
              {initial}
            </span>
          )}

          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleClickUpload}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-label="Thay đổi ảnh đại diện"
            >
              <Camera className="h-8 w-8 text-white" />
              <span className="mt-1.5 text-xs font-medium text-white">Đổi ảnh</span>
            </button>
          )}
        </div>

        {mode === 'edit' && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
          />
        )}
      </div>

      {/* Name + email */}
      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold text-primary">{profile.name || '—'}</h2>
        {profile.email && <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>}
      </div>

      {/* Divider */}
      <div className="my-6 h-px w-full bg-border" />

      {/* Action button */}
      <div className="w-full">
        {mode === 'view' ? (
          <Link
            to={editPath ?? PATHS.EDIT_PROFILE}
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
