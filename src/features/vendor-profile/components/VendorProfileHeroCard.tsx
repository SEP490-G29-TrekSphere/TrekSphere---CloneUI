import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VendorProfileDetail } from '../types';

interface VendorProfileHeroCardProps {
  profile: VendorProfileDetail;
  isManager: boolean;
  editPath: string;
}

/** Thẻ Hồ sơ Doanh nghiệp — logo + tên + mô tả + 2 nút hành động. */
export function VendorProfileHeroCard({
  profile,
  isManager,
  editPath,
}: VendorProfileHeroCardProps) {
  const initial = profile.companyName.charAt(0).toUpperCase();

  return (
    <div
      className="flex flex-col gap-5 rounded-[32px] p-6 sm:flex-row sm:items-start sm:p-8"
      style={{ backgroundColor: '#F6F4EB' }}
    >
      {/* Logo */}
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl text-2xl font-extrabold"
        style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
      >
        {profile.logoUrl ? (
          <img
            src={profile.logoUrl}
            alt={profile.companyName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-extrabold" style={{ color: '#06261D' }}>
          {profile.companyName}
        </h2>

        {profile.description && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6F7B75' }}>
            {profile.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {isManager && (
            <Link
              to={editPath}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
