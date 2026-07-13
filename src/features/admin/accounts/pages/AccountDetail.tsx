import {
  Download,
  Lock,
  MapPin,
  PenLine,
  Scale,
  ShieldCheck,
  Star,
  TrendingUp,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/store/useToastStore';
import AdminTopbar from '../../components/AdminTopbar';
import { ConfirmDialog, type ConfirmDialogVariant } from '../components/ConfirmDialog';
import { RoleBadge } from '../components/RoleBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { useAccountMutations } from '../hooks/useAccountMutations';
import { useAdminAccountDetail } from '../hooks/useAdminAccountDetail';

/**
 * Trang Chi tiết tài khoản — màn xem/thao tác 1 account trong Admin.
 *
 * Bố cục:
 * - Topbar (search).
 * - Page header: breadcrumb + tiêu đề + badge ID + 2 nút hành động.
 * - Content chia 2 cột: trái (profile card + map) / phải (stats + danger zone).
 */
export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: account, isLoading, isError, error } = useAdminAccountDetail(id ?? '');
  const { lock, unlock, revoke } = useAccountMutations(id ?? '');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<ConfirmDialogVariant>('lock');

  const openDialog = (variant: ConfirmDialogVariant) => {
    setDialogVariant(variant);
    setDialogOpen(true);
  };

  const handleLockUnlock = () => {
    if (!account) return;
    if (account.status === 'ACTIVE') {
      openDialog('lock');
    } else {
      void unlock
        .mutateAsync()
        .then(() => {
          toast.success(`Đã mở khóa tài khoản "${account.fullName}"`);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : 'Mở khóa thất bại');
        });
    }
  };

  const handleRevoke = () => {
    openDialog('revoke');
  };

  const handleConfirm = () => {
    if (dialogVariant === 'lock') {
      void lock
        .mutateAsync()
        .then(() => {
          toast.success(`Đã khóa tài khoản "${account?.fullName}"`);
          setDialogOpen(false);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : 'Khóa tài khoản thất bại');
        });
    } else if (dialogVariant === 'revoke') {
      void revoke
        .mutateAsync()
        .then(() => {
          toast.success(`Đã thu hồi giấy phép của "${account?.fullName}"`);
          setDialogOpen(false);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : 'Thu hồi giấy phép thất bại');
        });
    }
  };

  const isLocked = account?.status === 'LOCKED';

  return (
    <div className="flex h-screen flex-col">
      <AdminTopbar />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Breadcrumb */}
        <p className="mb-3 text-sm" style={{ color: '#6F7B75' }}>
          Quản lý dữ liệu / <span style={{ color: '#06261D' }}>Chi tiết tài khoản</span>
        </p>

        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold" style={{ color: '#06261D' }}>
              Chi tiết tài khoản
            </h2>
            {account && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: '#E8F5F0', color: '#06261D' }}
              >
                #{account.id.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#06261D',
                border: '1px solid #E6E2D1',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0EEE6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <Download className="h-4 w-4" />
              Xuất dữ liệu
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#06261D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0D3D2E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#06261D';
              }}
            >
              <PenLine className="h-4 w-4" />
              Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Main content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div
            className="flex items-center justify-center rounded-3xl py-20 text-sm"
            style={{ color: '#DC2626' }}
          >
            Không thể tải thông tin tài khoản:{' '}
            {error instanceof Error ? error.message : 'Lỗi không xác định'}
          </div>
        ) : !account ? (
          <div
            className="flex items-center justify-center rounded-3xl py-20 text-sm"
            style={{ color: '#6F7B75' }}
          >
            Không tìm thấy tài khoản này.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div
                className="overflow-hidden rounded-3xl bg-white p-6"
                style={{ border: '1px solid #E6E2D1' }}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* Avatar */}
                  <div className="relative shrink-0 self-center sm:self-auto">
                    <div className="relative inline-block">
                      <div
                        className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-3xl font-bold"
                        style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
                      >
                        {account.avatarUrl ? (
                          <img
                            src={account.avatarUrl}
                            alt={account.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          account.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* Shield badge */}
                      <div
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                        style={{ backgroundColor: '#06261D' }}
                      >
                        <ShieldCheck className="h-4 w-4" style={{ color: '#A2EBD2' }} />
                      </div>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="min-w-0 flex-1">
                    <InfoField label="HỌ VÀ TÊN" value={account.fullName} />
                    <InfoField label="VAI TRÒ" value={<RoleBadge role={account.role} />} />
                    <InfoField label="EMAIL" value={account.email} />
                    <InfoField label="SỐ ĐIỆN THOẠI" value={account.phone ?? '—'} />
                    <InfoField
                      label="NGÀY THAM GIA"
                      value={new Date(account.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    />
                    <InfoField
                      label="TRẠNG THÁI"
                      value={<StatusIndicator status={account.status} />}
                    />
                    <InfoField label="ĐỊA CHỈ" value={account.address ?? '—'} />
                  </div>
                </div>
              </div>

              {/* Map section */}
              <div
                className="relative overflow-hidden rounded-3xl"
                style={{ border: '1px solid #E6E2D1' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&h=400&fit=crop"
                  alt="Bản đồ vị trí"
                  className="h-56 w-full object-cover sm:h-72"
                />
                {/* Location tag overlay */}
                <div className="absolute left-4 top-4">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm"
                    style={{ backgroundColor: '#FFFFFF', color: '#06261D' }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: '#06261D' }} />
                    <span>
                      <span className="font-semibold">VỊ TRÍ GẦN NHẤT</span>
                      <span className="mx-1 text-gray-400">/</span>
                      {account.lastLocation?.label ?? 'Chưa có dữ liệu'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              {/* Stat cards */}
              <StatCard
                label="Số tour đã tham gia"
                value={account.toursJoined}
                subText={`+${account.toursJoinedGrowth} trong tháng này`}
                trend="up"
              />
              <StatCard
                label="Tổng chi tiêu"
                value={`${(account.totalSpent / 1_000_000).toFixed(1)}M`}
                unit="VND"
                subText=""
              />
              <StatCard
                label="Đánh giá trung bình"
                value={account.averageRating.toString()}
                showStars
                subText={`Trên ${account.reviewCount} nhận xét`}
              />

              {/* Danger zone */}
              <div
                className="rounded-3xl p-5"
                style={{
                  border: '2px dashed #EF4444',
                  backgroundColor: '#FEF2F2',
                }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#FEE2E2' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="#DC2626"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-bold" style={{ color: '#DC2626' }}>
                    Tác vụ nguy hiểm
                  </span>
                </div>

                <p className="mb-5 text-sm" style={{ color: '#6F7B75' }}>
                  Những thao tác dưới đây có thể ảnh hưởng nghiêm trọng đến tài khoản người dùng.
                  Vui lòng cân nhắc kỹ trước khi thực hiện.
                </p>

                {/* Lock / Unlock account */}
                <button
                  type="button"
                  className="mb-3 flex w-full items-center justify-between rounded-2xl border p-4 transition-colors"
                  style={{
                    borderColor: '#EF4444',
                    backgroundColor: '#FFFFFF',
                  }}
                  onClick={handleLockUnlock}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                      {isLocked ? 'MỞ KHÓA TÀI KHOẢN' : 'KHÓA TÀI KHOẢN'}
                    </div>
                    <div className="mt-0.5 text-xs" style={{ color: '#6F7B75' }}>
                      {isLocked
                        ? 'Cho phép người dùng đăng nhập trở lại'
                        : 'Tạm thời vô hiệu hóa quyền truy cập'}
                    </div>
                  </div>
                  {isLocked ? (
                    <Unlock className="h-5 w-5 shrink-0" style={{ color: '#DC2626' }} />
                  ) : (
                    <Lock className="h-5 w-5 shrink-0" style={{ color: '#DC2626' }} />
                  )}
                </button>

                {/* Revoke license */}
                <button
                  type="button"
                  className="mb-4 flex w-full items-center justify-between rounded-2xl border p-4 transition-colors disabled:opacity-40"
                  style={{
                    borderColor: '#EF4444',
                    backgroundColor: '#FFFFFF',
                  }}
                  disabled={account?.role === 'trekker'}
                  onClick={handleRevoke}
                  onMouseEnter={(e) => {
                    if (account?.role !== 'trekker')
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                      THU HỒI GIẤY PHÉP
                    </div>
                    <div className="mt-0.5 text-xs" style={{ color: '#6F7B75' }}>
                      {account?.role === 'trekker'
                        ? 'Tài khoản Trekker không có giấy phép để thu hồi'
                        : 'Xóa bỏ các quyền đặc biệt'}
                    </div>
                  </div>
                  <Scale className="h-5 w-5 shrink-0" style={{ color: '#DC2626' }} />
                </button>

                {/* Warning note */}
                <p className="text-xs italic" style={{ color: '#9CA3AF' }}>
                  Lưu ý: Mọi thao tác trong vùng này sẽ được lưu vào Nhật ký Hệ thống (System Audit
                  Log).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog xác nhận thao tác nguy hiểm */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={dialogVariant}
        accountName={account?.fullName ?? ''}
        onConfirm={handleConfirm}
        isPending={lock.isPending || revoke.isPending}
      />
    </div>
  );
}

/** Một trường thông tin trong profile card. */
function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
        {label}
      </p>
      <div style={{ color: '#06261D' }}>{value}</div>
    </div>
  );
}

/** Thẻ thống kê dạng kén nhỏ. */
function StatCard({
  label,
  value,
  unit,
  subText,
  showStars,
  trend,
}: {
  label: string;
  value: string | number;
  unit?: string;
  subText: string;
  showStars?: boolean;
  trend?: 'up' | 'down';
}) {
  return (
    <div
      className="flex flex-col items-center rounded-3xl bg-white p-5 text-center"
      style={{ border: '1px solid #E6E2D1' }}
    >
      <p
        className="mb-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: '#6F7B75' }}
      >
        {label}
      </p>
      <div className="mb-2 flex items-baseline justify-center gap-1">
        <span className="text-3xl font-bold" style={{ color: '#06261D' }}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium" style={{ color: '#6F7B75' }}>
            {unit}
          </span>
        )}
      </div>
      {showStars && (
        <div className="mb-2 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length array, never reorders
            <Star key={`star-${i}`} className="h-4 w-4" fill="#F59E0B" stroke="#F59E0B" />
          ))}
        </div>
      )}
      {subText && (
        <div
          className="flex items-center justify-center gap-1 text-xs"
          style={{ color: '#16A34A' }}
        >
          {trend === 'up' && <TrendingUp className="h-3 w-3" />}
          {subText}
        </div>
      )}
    </div>
  );
}

/** Loading skeleton. */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <div className="flex flex-col gap-6 sm:flex-row">
            <div
              className="h-28 w-28 shrink-0 rounded-full"
              style={{ backgroundColor: '#F0EEE6' }}
            />
            <div className="flex-1 space-y-3">
              {/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`skeleton-line-${i}`}
                  className="h-4 w-3/4 rounded"
                  style={{ backgroundColor: '#F0EEE6' }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="h-56 w-full rounded-3xl" style={{ backgroundColor: '#F0EEE6' }} />
      </div>
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 w-full rounded-3xl" style={{ backgroundColor: '#F0EEE6' }} />
        ))}
      </div>
    </div>
  );
}
