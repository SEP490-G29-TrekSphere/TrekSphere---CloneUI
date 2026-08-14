import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { RoleBadge } from '../components/RoleBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { useAdminAccountDetail } from '../hooks/useAdminAccountDetail';
import { ACCOUNT_GENDER_LABELS } from '../types.detail';

/**
 * Trang Chi tiết tài khoản — màn xem/thao tác 1 account trong Admin.
 *
 * Chỉ hiển thị các trường thật sự có trong `UserProfileResponse` của BE
 * (`GET /users/{userId}`) — không hiển thị số liệu giả (tour, chi tiêu,
 * đánh giá, vị trí bản đồ) vì BE chưa có API cung cấp các dữ liệu này.
 */
/** Mảng id tĩnh cho skeleton — tránh dùng index làm key (Biome noArrayIndexKey). */
const SKELETON_LINES = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: account, isLoading, isError, error } = useAdminAccountDetail(id ?? '');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3025] tracking-tight">
          Chi tiết tài khoản
        </h1>
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
        <div
          className="overflow-hidden rounded-3xl bg-white p-6"
          style={{ border: '1px solid #E6E2D1' }}
        >
          {/* LEFT COLUMN — Profile card */}
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
      )}
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
  );
}
