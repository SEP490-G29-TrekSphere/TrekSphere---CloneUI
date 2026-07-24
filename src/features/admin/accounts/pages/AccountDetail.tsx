import { CheckCircle2, Lock, ShieldCheck, Unlock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from '@/store/useToastStore';
import { ConfirmDialog, type ConfirmDialogVariant } from '../components/ConfirmDialog';
import { RoleBadge } from '../components/RoleBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { useAccountMutations } from '../hooks/useAccountMutations';
import { useAdminAccountDetail } from '../hooks/useAdminAccountDetail';
import { ACCOUNT_GENDER_LABELS } from '../types.detail';

/**
 * Trang Chi tiết tài khoản — màn xem/thao tác 1 account trong Admin.
 *
 * Chỉ hiển thị các trường thật sự có trong `UserProfileResponse` của BE
 * (`GET /users/{userId}`) — không hiển thị số liệu giả (tour, chi tiêu,
 * đánh giá, vị trí bản đồ) vì BE chưa có API cung cấp các dữ liệu này.
 *
 * Thanh search được đẩy lên Header chung của AdminLayout.
 */
/** Mảng id tĩnh cho skeleton — tránh dùng index làm key (Biome noArrayIndexKey). */
const SKELETON_LINES = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: account, isLoading, isError, error } = useAdminAccountDetail(id ?? '');
  const { lock, unlock } = useAccountMutations(id ?? '');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogVariant: ConfirmDialogVariant = 'lock';

  const handleLockUnlock = () => {
    if (!account) return;
    if (account.status === 'ACTIVE') {
      setDialogOpen(true);
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

  const handleConfirmLock = () => {
    void lock
      .mutateAsync()
      .then(() => {
        toast.success(`Đã khóa tài khoản "${account?.fullName}"`);
        setDialogOpen(false);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Khóa tài khoản thất bại');
      });
  };

  const isLocked = account?.status === 'LOCKED';
  const isDeactivated = account?.status === 'DEACTIVATED';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <p className="text-sm" style={{ color: '#6F7B75' }}>
        Quản lý dữ liệu / <span style={{ color: '#06261D' }}>Chi tiết tài khoản</span>
      </p>

      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold text-[#0B3025] tracking-tight">
          Chi tiết tài khoản
        </h1>
        {account && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: '#E8F5F0', color: '#06261D' }}
          >
            #{account.id.slice(0, 8).toUpperCase()}
          </span>
        )}
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
          {/* LEFT COLUMN — Profile card */}
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
                <InfoField
                  label="EMAIL ĐÃ XÁC THỰC"
                  value={
                    account.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#16A34A]">
                        <CheckCircle2 className="h-4 w-4" />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DC2626]">
                        <XCircle className="h-4 w-4" />
                        Chưa xác thực
                      </span>
                    )
                  }
                />
                <InfoField label="SỐ ĐIỆN THOẠI" value={account.phone ?? '—'} />
                <InfoField
                  label="GIỚI TÍNH"
                  value={account.gender ? ACCOUNT_GENDER_LABELS[account.gender] : '—'}
                />
                <InfoField
                  label="NGÀY SINH"
                  value={
                    account.dateOfBirth
                      ? new Date(account.dateOfBirth).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'
                  }
                />
                <InfoField label="TRẠNG THÁI" value={<StatusIndicator status={account.status} />} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Danger zone */}
          <div className="space-y-5">
            <div
              className="rounded-3xl p-5"
              style={{
                border: isDeactivated ? '1px solid #E6E2D1' : '2px dashed #EF4444',
                backgroundColor: isDeactivated ? '#FFFFFF' : '#FEF2F2',
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: isDeactivated ? '#F0EEE6' : '#FEE2E2' }}
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
                      stroke={isDeactivated ? '#6F7B75' : '#DC2626'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  className="font-bold"
                  style={{ color: isDeactivated ? '#6F7B75' : '#DC2626' }}
                >
                  {isDeactivated ? 'Tài khoản đã vô hiệu hóa' : 'Tác vụ nguy hiểm'}
                </span>
              </div>

              {isDeactivated ? (
                <p className="text-sm" style={{ color: '#6F7B75' }}>
                  Tài khoản này đã bị người dùng tự vô hiệu hóa. Admin không thể khóa hoặc mở khóa
                  tài khoản ở trạng thái này.
                </p>
              ) : (
                <>
                  <p className="mb-5 text-sm" style={{ color: '#6F7B75' }}>
                    Thao tác dưới đây có thể ảnh hưởng nghiêm trọng đến quyền truy cập của người
                    dùng. Vui lòng cân nhắc kỹ trước khi thực hiện.
                  </p>

                  {/* Lock / Unlock account */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border p-4 transition-colors"
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

                  {/* Warning note */}
                  <p className="mt-4 text-xs italic" style={{ color: '#9CA3AF' }}>
                    Lưu ý: Mọi thao tác trong vùng này sẽ được lưu vào Nhật ký Hệ thống (System
                    Audit Log).
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog xác nhận khóa tài khoản */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={dialogVariant}
        accountName={account?.fullName ?? ''}
        onConfirm={handleConfirmLock}
        isPending={lock.isPending}
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

/** Loading skeleton. */
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="h-28 w-28 shrink-0 rounded-full" style={{ backgroundColor: '#F0EEE6' }} />
          <div className="flex-1 space-y-3">
            {SKELETON_LINES.map((id) => (
              <div key={id} className="h-4 w-3/4 rounded" style={{ backgroundColor: '#F0EEE6' }} />
            ))}
          </div>
        </div>
      </div>
      <div className="h-56 w-full rounded-3xl" style={{ backgroundColor: '#F0EEE6' }} />
    </div>
  );
}
