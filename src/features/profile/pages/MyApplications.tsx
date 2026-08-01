import { ArrowLeft, Pencil, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  ApplicationStatus,
  VendorApplicationDetail,
} from '@/features/admin/services/vendorApplicationService';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppCardContent,
  AppInput,
  AppSpinner,
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
  ConfirmActionDialog,
} from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { CreateApplicationDialog } from '../components/CreateApplicationDialog';
import {
  useCreateDraftApplication,
  useMyVendorApplications,
  useResubmitVendorApplication,
  useSubmitVendorApplication,
  useUpdateVendorApplication,
} from '../hooks/useMyApplications';

export default function MyApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<VendorApplicationDetail | null>(
    null
  );
  const [confirmSubmitId, setConfirmSubmitId] = useState<string | null>(null);
  const [confirmResubmitId, setConfirmResubmitId] = useState<string | null>(null);
  const pageSize = 10;

  const { mutate: createDraft, isPending: isCreating } = useCreateDraftApplication();
  const { mutate: submitApp, isPending: isSubmitting } = useSubmitVendorApplication();
  const { mutate: updateApp, isPending: isUpdating } = useUpdateVendorApplication();
  const { mutate: resubmitApp, isPending: isResubmitting } = useResubmitVendorApplication();

  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyVendorApplications({
    status: activeTab,
    keyword: appliedKeyword,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleCreateDraftSubmit = (formData: FormData) => {
    createDraft(formData, {
      onSuccess: () => {
        toast.success('Đã lưu bản nháp đơn đăng ký Vendor thành công!');
        setCreateDialogOpen(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Tạo bản nháp thất bại. Vui lòng thử lại.'
        );
      },
    });
  };

  const handleUpdateSubmit = (formData: FormData) => {
    if (!editingApplication) return;
    updateApp(
      { id: editingApplication.vendorApplicationId, formData },
      {
        onSuccess: () => {
          toast.success('Cập nhật thông tin đơn đăng ký Vendor thành công!');
          setEditingApplication(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  const handleConfirmSubmit = () => {
    if (!confirmSubmitId) return;
    submitApp(confirmSubmitId, {
      onSuccess: () => {
        toast.success('Đã nộp đơn đăng ký Vendor thành công!');
        setConfirmSubmitId(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Nộp đơn đăng ký thất bại. Vui lòng thử lại.'
        );
      },
    });
  };

  const handleConfirmResubmit = () => {
    if (!confirmResubmitId) return;
    resubmitApp(confirmResubmitId, {
      onSuccess: () => {
        toast.success('Đã nộp lại đơn đăng ký Vendor thành công!');
        setConfirmResubmitId(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Nộp lại đơn đăng ký thất bại. Vui lòng thử lại.'
        );
      },
    });
  };

  const handleTabChange = (status: ApplicationStatus | 'ALL') => {
    setActiveTab(status);
    setCurrentPage(0);
  };

  const handlePageChange = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < (responseData?.totalPages ?? 1)) {
      setCurrentPage(pageIndex);
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
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
            CHỜ DUYỆT
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
            TỪ CHỐI
          </span>
        );
    }
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

  const totalElements = responseData?.totalElements ?? 0;
  const totalPages = responseData?.totalPages ?? 0;
  const applications = responseData?.content ?? [];

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

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-primary md:text-3xl">Lịch sử đăng ký Vendor</h1>
          <p className="text-sm text-muted-foreground">
            Xem các đơn đăng ký trở thành đối tác cung cấp dịch vụ của bạn
          </p>
        </div>
        <AppButton
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#0B3025] hover:bg-[#08221a] text-white font-bold rounded-xl px-5 h-10 w-full sm:w-auto self-start sm:self-center"
        >
          Đăng ký Vendor mới
        </AppButton>
      </header>

      {/* Filter and Search */}
      <div className="flex flex-col gap-4 border-b border-[#E5E4DE] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DRAFT'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-[#0B3025] text-white shadow-sm'
                    : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
                }`}
              >
                {tab === 'ALL' && 'Tất cả'}
                {tab === 'PENDING' && 'Chờ duyệt'}
                {tab === 'APPROVED' && 'Đã duyệt'}
                {tab === 'REJECTED' && 'Từ chối'}
                {tab === 'DRAFT' && 'Bản nháp'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <AppInput
                type="text"
                placeholder="Tìm tên công ty..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9 bg-white border-[#E5E4DE] rounded-xl text-sm"
              />
            </div>
            <AppButton
              type="submit"
              variant="outline"
              className="border-[#E5E4DE] text-zinc-700 font-bold rounded-xl"
            >
              Tìm
            </AppButton>
          </form>
        </div>
      </div>

      {/* Applications Table */}
      <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl overflow-hidden bg-white">
        <AppCardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-3">
              <AppSpinner size="lg" />
              <p className="text-sm font-semibold">Đang tải lịch sử đăng ký...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 text-red-600 gap-3">
              <p className="font-bold text-base">Không thể tải lịch sử đơn đăng ký</p>
              <p className="text-xs text-zinc-500 max-w-md text-center">
                {error instanceof Error ? error.message : 'Lỗi kết nối máy chủ.'}
              </p>
              <AppButton
                onClick={() => refetch()}
                variant="outline"
                className="mt-2 flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 font-bold rounded-xl"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </AppButton>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <p className="font-bold text-base">Không tìm thấy đơn đăng ký nào</p>
              <p className="text-xs mt-1 text-zinc-400">
                Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <AppTable>
              <AppTableHeader className="bg-[#FAF9F5] border-b border-[#E5E4DE]">
                <AppTableRow className="hover:bg-transparent">
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    TÊN CÔNG TY
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    LIÊN HỆ
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    MÔ TẢ KINH DOANH
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    NGÀY NỘP
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    TRẠNG THÁI
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    LÝ DO TỪ CHỐI
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6 text-right">
                    THAO TÁC
                  </AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {applications.map((app) => (
                  <AppTableRow
                    key={app.vendorApplicationId}
                    className="border-b border-[#F4F4F2] hover:bg-[#FAF9F5] transition-colors"
                  >
                    <AppTableCell className="py-4 px-6 font-bold text-zinc-800 text-sm">
                      {app.companyName}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6">
                      <div className="flex flex-col text-xs text-zinc-600 font-medium">
                        <span>{app.contactEmail}</span>
                        <span className="text-zinc-400">{app.contactPhone}</span>
                      </div>
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6 text-sm text-zinc-600 max-w-[200px] truncate">
                      {app.businessDescription || '—'}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6 text-zinc-600 text-sm font-semibold">
                      {formatDate(app.createdAt)}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6">
                      {getStatusBadge(app.applicationStatus)}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6 text-sm text-red-600 font-medium max-w-[200px] truncate">
                      {app.rejectionReason || '—'}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.applicationStatus === 'DRAFT' && (
                          <AppButton
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmSubmitId(app.vendorApplicationId)}
                            className="h-8 rounded-lg border-[#0B3025] text-[#0B3025] hover:bg-[#0B3025] hover:text-white text-xs font-bold px-3 cursor-pointer"
                          >
                            Nộp đơn
                          </AppButton>
                        )}
                        {app.applicationStatus === 'REJECTED' && (
                          <AppButton
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmResubmitId(app.vendorApplicationId)}
                            className="h-8 rounded-lg border-[#0B3025] text-[#0B3025] hover:bg-[#0B3025] hover:text-white text-xs font-bold px-3 cursor-pointer"
                          >
                            Nộp lại
                          </AppButton>
                        )}
                        {(app.applicationStatus === 'DRAFT' ||
                          app.applicationStatus === 'REJECTED') && (
                          <AppButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingApplication(app)}
                            className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer flex items-center justify-center"
                            title="Chỉnh sửa đơn"
                          >
                            <Pencil className="h-4 w-4" />
                          </AppButton>
                        )}
                      </div>
                    </AppTableCell>
                  </AppTableRow>
                ))}
              </AppTableBody>
            </AppTable>
          )}
        </AppCardContent>
      </AppCard>

      {/* Pagination */}
      {!isLoading && !isError && totalElements > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <span className="text-xs text-zinc-500 font-semibold">
            Hiển thị {currentPage * pageSize + 1} -{' '}
            {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements} hồ sơ
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E4DE] bg-white text-zinc-600 disabled:opacity-50 hover:bg-[#FAF9F5] transition-colors"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map((pageIndex) => (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => handlePageChange(pageIndex)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    currentPage === pageIndex
                      ? 'bg-[#0B3025] text-white shadow-sm'
                      : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E4DE] bg-white text-zinc-600 disabled:opacity-50 hover:bg-[#FAF9F5] transition-colors"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      )}
      <CreateApplicationDialog
        open={createDialogOpen || !!editingApplication}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingApplication(null);
          }
        }}
        onSubmit={editingApplication ? handleUpdateSubmit : handleCreateDraftSubmit}
        isPending={isCreating || isUpdating}
        initialData={editingApplication || undefined}
      />
      {confirmSubmitId && (
        <ConfirmActionDialog
          title="Xác nhận nộp đơn"
          description="Bạn có chắc chắn muốn nộp đơn đăng ký này? Sau khi nộp đơn, bạn sẽ không thể chỉnh sửa và đơn sẽ được chuyển tới bộ phận Admin để duyệt."
          confirmLabel="Nộp đơn"
          cancelLabel="Hủy"
          isPending={isSubmitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmSubmitId(null)}
        />
      )}
      {confirmResubmitId && (
        <ConfirmActionDialog
          title="Xác nhận nộp lại đơn"
          description="Bạn có chắc chắn muốn nộp lại đơn đăng ký này? Đơn sẽ được chuyển tới bộ phận Admin để duyệt lại."
          confirmLabel="Nộp lại"
          cancelLabel="Hủy"
          isPending={isResubmitting}
          onConfirm={handleConfirmResubmit}
          onCancel={() => setConfirmResubmitId(null)}
        />
      )}
    </div>
  );
}
