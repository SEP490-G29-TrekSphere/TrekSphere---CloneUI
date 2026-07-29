import { Download, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
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
} from '@/shared/ui';
import { useVendorApplicationStats, useVendorApplications } from '../hooks/useVendorApplications';
import type { ApplicationStatus } from '../services/vendorApplicationService';

export default function Applications() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // 0-based page number cho BE API
  const pageSize = 10;

  // Lấy dữ liệu danh sách từ API qua React Query hook
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useVendorApplications({
    status: activeTab,
    keyword: appliedKeyword,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  // Lấy dữ liệu thống kê
  const { data: statsData } = useVendorApplicationStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(searchKeyword);
    setCurrentPage(0);
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
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B3025] tracking-tight">
            Hồ sơ Đăng ký Đối tác
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            Quản lý, tìm kiếm và phân trang các đơn đăng ký trở thành nhà cung cấp Tour di sản.
          </p>
        </div>
        <AppButton className="bg-[#0B3025] hover:bg-[#072019] text-white flex items-center gap-2 self-start sm:self-center font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors border-none">
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </AppButton>
      </div>

      {/* Tabs and Search / Filter */}
      <div className="flex flex-col gap-4 border-b border-[#E5E4DE] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
              }`}
            >
              Tất cả {statsData ? `(${statsData.all})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('PENDING')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
              }`}
            >
              Chờ duyệt {statsData ? `(${statsData.pending})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('APPROVED')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
              }`}
            >
              Đã duyệt {statsData ? `(${statsData.approved})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('REJECTED')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'REJECTED'
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
              }`}
            >
              Từ chối {statsData ? `(${statsData.rejected})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('DRAFT')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === 'DRAFT'
                  ? 'bg-[#0B3025] text-white shadow-sm'
                  : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
              }`}
            >
              Bản nháp {statsData ? `(${statsData.draft})` : ''}
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <AppInput
                type="text"
                placeholder="Tìm tên công ty, email..."
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

      {/* Main Content / Table */}
      <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl overflow-hidden bg-white">
        <AppCardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-3">
              <AppSpinner size="lg" />
              <p className="text-sm font-semibold">Đang tải danh sách đơn đăng ký...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 text-red-600 gap-3">
              <p className="font-bold text-base">Không thể tải danh sách đơn đăng ký</p>
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
                    CÔNG TY & NGƯỜI ĐĂNG KÝ
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    LIÊN HỆ
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    NGÀY GỬI
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                    TRẠNG THÁI
                  </AppTableHead>
                  <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6 text-right">
                    HÀNH ĐỘNG
                  </AppTableHead>
                </AppTableRow>
              </AppTableHeader>
              <AppTableBody>
                {applications.map((app) => (
                  <AppTableRow
                    key={app.vendorApplicationId}
                    className="border-b border-[#F4F4F2] hover:bg-[#FAF9F5] transition-colors"
                  >
                    <AppTableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B3025] text-white text-sm font-bold shadow-sm overflow-hidden">
                          {app.applicant.avatarUrl ? (
                            <img
                              src={app.applicant.avatarUrl}
                              alt={app.applicant.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            app.companyName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-800 text-sm">{app.companyName}</span>
                          <span className="text-xs text-zinc-500 font-medium">
                            Người nộp: {app.applicant.fullName || app.applicant.email}
                          </span>
                        </div>
                      </div>
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6">
                      <div className="flex flex-col text-xs text-zinc-600 font-medium">
                        <span>{app.contactEmail}</span>
                        <span className="text-zinc-400">{app.contactPhone}</span>
                      </div>
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6 text-zinc-600 text-sm font-semibold">
                      {formatDate(app.createdAt)}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6">
                      {getStatusBadge(app.applicationStatus)}
                    </AppTableCell>
                    <AppTableCell className="py-4 px-6 text-right">
                      <Link
                        to={PATHS.ADMIN_APPLICATION_DETAIL.replace(':id', app.vendorApplicationId)}
                      >
                        <AppButton
                          variant="outline"
                          className="border-[#E5E4DE] text-zinc-700 hover:bg-[#F4F4F2] font-semibold text-xs py-1.5 px-4 rounded-xl"
                        >
                          Xem chi tiết
                        </AppButton>
                      </Link>
                    </AppTableCell>
                  </AppTableRow>
                ))}
              </AppTableBody>
            </AppTable>
          )}
        </AppCardContent>
      </AppCard>

      {/* Pagination Footer */}
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

      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-3 pt-4">
        {/* Total Applications Card */}
        <div className="bg-[#0B3025] shadow-md text-white rounded-2xl p-6 flex flex-col justify-between h-44">
          <span className="text-zinc-300 text-xs font-bold tracking-wide">Tổng số đơn đăng ký</span>
          <div className="my-2">
            <h2 className="text-5xl font-extrabold tracking-tight">{statsData?.all ?? 0}</h2>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <span>Đã cập nhật hệ thống</span>
          </div>
        </div>

        {/* Pending Card */}
        <AppCard className="bg-white border border-[#E5E4DE] shadow-sm rounded-2xl p-6 flex flex-col justify-between h-44">
          <span className="text-zinc-400 text-xs font-bold tracking-wide">Đơn chờ xét duyệt</span>
          <div className="my-2">
            <h2 className="text-5xl font-extrabold text-[#D97706] tracking-tight">
              {statsData?.pending ?? 0}
            </h2>
          </div>
          <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#D97706] h-full rounded-full transition-all"
              style={{
                width: `${statsData?.all ? Math.round((statsData.pending / statsData.all) * 100) : 0}%`,
              }}
            />
          </div>
        </AppCard>

        {/* Approved Card */}
        <AppCard className="bg-[#FAF9F5] border border-[#E5E4DE] shadow-sm rounded-2xl p-6 flex flex-col justify-between h-44">
          <span className="text-zinc-400 text-xs font-bold tracking-wide">Đơn đã duyệt</span>
          <div className="my-2">
            <h2 className="text-5xl font-extrabold text-[#059669] tracking-tight">
              {statsData?.approved ?? 0}
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-semibold">
            Tỷ lệ duyệt:{' '}
            {statsData?.all ? `${Math.round((statsData.approved / statsData.all) * 100)}%` : '0%'}
          </span>
        </AppCard>
      </div>
    </div>
  );
}
