import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PATHS, ROLES } from '@/constants';
import { AppBadge, AppButton, AppCard, AppSpinner, ConfirmActionDialog } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import {
  useReviewVendorApplication,
  useVendorApplicationDetail,
} from '../hooks/useVendorApplications';
import type { ApplicationStatus } from '../services/vendorApplicationService';

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAppStore((state) => state.user);

  const { data: application, isLoading, isError, error, refetch } = useVendorApplicationDetail(id);

  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const { mutate: reviewApplication, isPending: isReviewing } = useReviewVendorApplication();

  const handleApprove = () => {
    if (!id) return;
    reviewApplication(
      { id, status: 'APPROVED' },
      {
        onSuccess: () => {
          toast.success('Phê duyệt đơn đăng ký đối tác thành công.');
          setConfirmApproveOpen(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Phê duyệt thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!rejectionReason.trim()) {
      setRejectionError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setRejectionError('');
    reviewApplication(
      { id, status: 'REJECTED', rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          toast.success('Đã từ chối đơn đăng ký đối tác.');
          setRejectOpen(false);
          setRejectionReason('');
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Từ chối đơn thất bại. Vui lòng thử lại.'
          );
        },
      }
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <AppBadge
            variant="secondary"
            className="bg-zinc-100 text-zinc-700 font-bold border-zinc-200"
          >
            NHÁP
          </AppBadge>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#D97706] bg-[#FEF3C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706] animate-pulse" />
            ĐANG CHỜ DUYỆT
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#059669] bg-[#D1FAE5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            ĐÃ DUYỆT
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#DC2626] bg-[#FEE2E2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            ĐÃ TỪ CHỐI
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-zinc-500 gap-3">
        <AppSpinner size="lg" />
        <p className="text-sm font-semibold">Đang tải chi tiết đơn đăng ký...</p>
      </div>
    );
  }

  // Exception Sequence/Flow: Application data is corrupted or unavailable
  if (isError || !application) {
    return (
      <div className="space-y-6">
        <Link
          to={PATHS.ADMIN_APPLICATIONS}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#0B3025] font-bold text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl p-8 text-center bg-white flex flex-col items-center justify-center gap-3">
          <h2 className="text-xl font-bold text-red-600">Unable to load application documents</h2>
          <p className="text-zinc-500 text-sm max-w-md">
            {error instanceof Error
              ? error.message
              : 'Không thể tải hồ sơ hoặc tài liệu đơn đăng ký.'}
          </p>
          <AppButton
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 font-bold rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </AppButton>
        </AppCard>
      </div>
    );
  }

  // Quyền truy cập: Trekker (phải là người đã nộp đơn) hoặc Admin
  const isAdmin = currentUser?.roles?.some((role) => role.toLowerCase() === ROLES.ADMIN);
  const isApplicant = currentUser?.id && application.applicant.id === currentUser.id;

  if (!isAdmin && !isApplicant) {
    return (
      <div className="space-y-6">
        <Link
          to={PATHS.HOME}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#0B3025] font-bold text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>
        <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl p-8 text-center bg-white flex flex-col items-center justify-center gap-3">
          <h2 className="text-xl font-bold text-red-600">Bạn không có quyền truy cập hồ sơ này</h2>
          <p className="text-zinc-500 text-sm max-w-md">
            Chỉ Admin hoặc chính Trekker nộp đơn mới có quyền xem thông tin chi tiết của đơn đăng ký
            này.
          </p>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button / Navigation Header */}
      <Link
        to={isAdmin ? PATHS.ADMIN_APPLICATIONS : PATHS.HOME}
        className="inline-flex items-center gap-2 text-zinc-800 hover:text-[#0B3025] font-extrabold text-lg transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Chi tiết Đơn đăng ký Vendor
      </Link>

      {/* Top Banner Card with Status */}
      <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-zinc-900">{application.companyName}</h2>
            <div className="flex items-center gap-3 mt-1">
              {getStatusBadge(application.applicationStatus)}
              <span className="text-xs text-zinc-400 font-medium">
                Mã đơn: {application.vendorApplicationId}
              </span>
            </div>
          </div>

          {isAdmin && application.applicationStatus === 'PENDING' && (
            <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
              <AppButton
                onClick={() => setConfirmApproveOpen(true)}
                disabled={isReviewing}
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-xs px-4 py-2 border-none cursor-pointer"
              >
                Phê duyệt
              </AppButton>
              <AppButton
                onClick={() => {
                  setRejectionReason('');
                  setRejectionError('');
                  setRejectOpen(true);
                }}
                disabled={isReviewing}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs px-4 py-2 cursor-pointer"
              >
                Từ chối
              </AppButton>
            </div>
          )}
        </div>
        {application.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            <strong>Lý do từ chối:</strong> {application.rejectionReason}
          </div>
        )}
      </AppCard>

      {/* Grid Layout of details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Columns - Applicant & Company Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Applicant Info */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-2 border-b border-[#F4F4F2] pb-4 mb-6">
              <span className="text-[#0B3025] font-bold text-lg">👤</span>
              <h3 className="font-extrabold text-base text-zinc-800 tracking-tight">
                THÔNG TIN NGƯỜI NỘP ĐƠN
              </h3>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B3025] text-white text-base font-bold shadow-sm overflow-hidden">
                {application.applicant.avatarUrl ? (
                  <img
                    src={application.applicant.avatarUrl}
                    alt={application.applicant.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (application.applicant.fullName || application.applicant.email)
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2 flex-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    HỌ VÀ TÊN
                  </span>
                  <p className="font-bold text-sm text-zinc-800">
                    {application.applicant.fullName || '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    EMAIL TÀI KHOẢN
                  </span>
                  <p className="font-bold text-sm text-zinc-800">{application.applicant.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    ID TÀI KHOẢN
                  </span>
                  <p className="font-mono text-xs font-semibold text-zinc-600">
                    {application.applicant.id}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    VAI TRÒ TÀI KHOẢN
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {application.applicant.roles?.map((role) => (
                      <AppBadge key={role} variant="outline" className="text-[10px]">
                        {role}
                      </AppBadge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AppCard>

          {/* Card 2: Company Details */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 md:p-8">
            <div className="flex items-center gap-2 border-b border-[#F4F4F2] pb-4 mb-6">
              <span className="text-[#0B3025] font-bold text-lg">💼</span>
              <h3 className="font-extrabold text-base text-zinc-800 tracking-tight">
                THÔNG TIN DOANH NGHIỆP / TỔ CHỨC
              </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  TÊN CÔNG TY / THƯƠNG HIỆU
                </span>
                <p className="font-bold text-sm text-zinc-800">{application.companyName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  MÃ SỐ THUẾ
                </span>
                <p className="font-bold text-sm text-zinc-800">{application.taxCode || '—'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  EMAIL LIÊN HỆ
                </span>
                <p className="font-bold text-sm text-zinc-800">{application.contactEmail}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  SỐ ĐIỆN THOẠI LIÊN HỆ
                </span>
                <p className="font-bold text-sm text-zinc-800">{application.contactPhone}</p>
              </div>

              {application.businessDescription && (
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    MÔ TẢ HOẠT ĐỘNG KINH DOANH
                  </span>
                  <p className="text-zinc-600 text-sm font-medium leading-relaxed bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E4DE]">
                    {application.businessDescription}
                  </p>
                </div>
              )}
            </div>
          </AppCard>
        </div>

        {/* Right Column - Documents & Metadata */}
        <div className="space-y-6">
          {/* Business License Document Card */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F4F4F2] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#0B3025] font-bold text-lg">📄</span>
                <h3 className="font-extrabold text-base text-zinc-800 tracking-tight">
                  GIẤY PHÉP KINH DOANH
                </h3>
              </div>
              {application.businessLicenseUrl && (
                <a
                  href={application.businessLicenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-[#0B3025] transition-colors p-1"
                  title="Mở tài liệu trong tab mới"
                >
                  <ExternalLink className="h-4.5 w-4.5" />
                </a>
              )}
            </div>

            {application.businessLicenseUrl ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 overflow-hidden bg-[#FAF9F5] p-2 flex flex-col items-center justify-center">
                <img
                  src={application.businessLicenseUrl}
                  alt="Giấy phép kinh doanh"
                  className="max-h-72 w-full object-contain rounded-xl shadow-sm hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    // Tránh vỡ ảnh nếu URL không phải là file image trực tiếp
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <a
                  href={application.businessLicenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-bold text-[#0B3025] underline flex items-center gap-1 p-2"
                >
                  Xem / Tải file giấy phép kinh doanh <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-400 text-xs font-semibold bg-[#FAF9F5] rounded-2xl border border-dashed border-zinc-200">
                Chưa đính kèm file Giấy phép kinh doanh
              </div>
            )}
          </AppCard>

          {/* Submission Info Card */}
          <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-[#FAF9F5] p-6 space-y-3">
            <div className="text-xs text-zinc-500 font-semibold space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                <span>Ngày gửi đơn:</span>
                <span className="font-bold text-zinc-800">{formatDate(application.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>
                <span className="font-bold text-zinc-800">{application.applicationStatus}</span>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      {confirmApproveOpen && (
        <ConfirmActionDialog
          title="Xác nhận phê duyệt"
          description={`Bạn có chắc chắn muốn phê duyệt đơn đăng ký đối tác cho công ty ${application.companyName}?`}
          confirmLabel="Phê duyệt"
          isPending={isReviewing}
          onConfirm={handleApprove}
          onCancel={() => setConfirmApproveOpen(false)}
        />
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Từ chối đơn đăng ký</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối đơn đăng ký của{' '}
              <span className="font-semibold">{application.companyName}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReject} className="space-y-4">
            <div className="space-y-1.5">
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) {
                    setRejectionError('');
                  }
                }}
                className={`min-h-24 w-full ${rejectionError ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
                disabled={isReviewing}
              />
              {rejectionError && (
                <p className="text-xs font-semibold text-red-600">{rejectionError}</p>
              )}
            </div>

            <DialogFooter className="!mt-4 gap-2">
              <AppButton
                type="button"
                variant="outline"
                className="flex-1 rounded-full py-2.5"
                onClick={() => setRejectOpen(false)}
                disabled={isReviewing}
              >
                Hủy
              </AppButton>
              <AppButton
                type="submit"
                disabled={isReviewing}
                className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 border-none cursor-pointer"
              >
                {isReviewing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Từ chối'
                )}
              </AppButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
