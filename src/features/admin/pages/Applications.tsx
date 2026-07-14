import { Download, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import {
  AppButton,
  AppCard,
  AppCardContent,
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
} from '@/shared/ui';

interface Application {
  id: string;
  companyName: string;
  email: string;
  logoText: string;
  logoBg: string;
  logoColor: string;
  submitDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockApplications: Application[] = [
  {
    id: '1',
    companyName: 'Hội An Heritage Tours',
    email: 'contact@hoiantours.vn',
    logoText: 'HA',
    logoBg: '#E8F1EE',
    logoColor: '#0B3025',
    submitDate: '22/05/2024',
    status: 'pending',
  },
  {
    id: '2',
    companyName: 'Sapa Trekking Co.',
    email: 'info@sapatrekking.com',
    logoText: 'ST',
    logoBg: '#E8F5E9',
    logoColor: '#2E7D32',
    submitDate: '18/05/2024',
    status: 'approved',
  },
  {
    id: '3',
    companyName: 'Đà Lạt Adventures',
    email: 'hello@dalatadv.vn',
    logoText: 'DL',
    logoBg: '#FFEBEE',
    logoColor: '#C62828',
    submitDate: '15/05/2024',
    status: 'rejected',
  },
  {
    id: '4',
    companyName: 'Mekong Travel Ltd.',
    email: 'booking@mekongtravel.vn',
    logoText: 'MT',
    logoBg: '#E8F5E9',
    logoColor: '#2E7D32',
    submitDate: '12/05/2024',
    status: 'approved',
  },
  {
    id: '5',
    companyName: 'Hanoi Culture Guides',
    email: 'hanoi@cultureguides.vn',
    logoText: 'HC',
    logoBg: '#E8F1EE',
    logoColor: '#0B3025',
    submitDate: '10/05/2024',
    status: 'pending',
  },
  {
    id: '6',
    companyName: 'Ha Long Cruise Partners',
    email: 'partner@halongcruises.com',
    logoText: 'HL',
    logoBg: '#E8F5E9',
    logoColor: '#2E7D32',
    submitDate: '08/05/2024',
    status: 'approved',
  },
  {
    id: '7',
    companyName: 'Ninh Binh Eco Journeys',
    email: 'eco@ninhbinh.vn',
    logoText: 'NB',
    logoBg: '#FFEBEE',
    logoColor: '#C62828',
    submitDate: '05/05/2024',
    status: 'rejected',
  },
  {
    id: '8',
    companyName: 'Hue Imperial Explorer',
    email: 'hue@imperialexplorer.vn',
    logoText: 'HI',
    logoBg: '#E8F5E9',
    logoColor: '#2E7D32',
    submitDate: '01/05/2024',
    status: 'approved',
  },
];

export default function Applications() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') return mockApplications;
    return mockApplications.filter((app) => app.status === activeTab);
  }, [activeTab]);

  const totalItems = filteredApplications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage]);

  const counts = useMemo(() => {
    const all = mockApplications.length;
    const pending = mockApplications.filter((app) => app.status === 'pending').length;
    const approved = mockApplications.filter((app) => app.status === 'approved').length;
    const rejected = mockApplications.filter((app) => app.status === 'rejected').length;
    return { all, pending, approved, rejected };
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#D97706] bg-[#FEF3C7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
            CHỜ DUYỆT
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#059669] bg-[#D1FAE5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            ĐÃ DUYỆT
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#DC2626] bg-[#FEE2E2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            TỪ CHỐI
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B3025] tracking-tight">Hồ sơ Đối tác</h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            Quản lý và phê duyệt các đơn đăng ký trở thành nhà cung cấp Tour di sản.
          </p>
        </div>
        <AppButton className="bg-[#0B3025] hover:bg-[#072019] text-white flex items-center gap-2 self-start sm:self-center font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors border-none">
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </AppButton>
      </div>

      {/* Tabs and Advanced Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E4DE] pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('pending');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
            }`}
          >
            Chờ duyệt ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('approved');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'approved'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
            }`}
          >
            Đã duyệt ({counts.approved})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('rejected');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeTab === 'rejected'
                ? 'bg-[#0B3025] text-white shadow-sm'
                : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
            }`}
          >
            Từ chối ({counts.rejected})
          </button>
        </div>
        <AppButton
          variant="outline"
          className="border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5] flex items-center gap-2 font-bold px-4 py-2 rounded-xl self-start sm:self-center"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc nâng cao
        </AppButton>
      </div>

      {/* Applications Table Card */}
      <AppCard className="border-[#E5E4DE] shadow-sm rounded-2xl overflow-hidden bg-white">
        <AppCardContent className="p-0">
          <AppTable>
            <AppTableHeader className="bg-[#FAF9F5] border-b border-[#E5E4DE]">
              <AppTableRow className="hover:bg-transparent">
                <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                  TÊN CÔNG TY
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
              {paginatedApplications.map((app) => (
                <AppTableRow
                  key={app.id}
                  className="border-b border-[#F4F4F2] hover:bg-[#FAF9F5] transition-colors"
                >
                  <AppTableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold shadow-sm"
                        style={{ backgroundColor: app.logoBg, color: app.logoColor }}
                      >
                        {app.logoText}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-800 text-sm">{app.companyName}</span>
                        <span className="text-xs text-zinc-400 font-medium">{app.email}</span>
                      </div>
                    </div>
                  </AppTableCell>
                  <AppTableCell className="py-4 px-6 text-zinc-600 text-sm font-semibold">
                    {app.submitDate}
                  </AppTableCell>
                  <AppTableCell className="py-4 px-6">{getStatusBadge(app.status)}</AppTableCell>
                  <AppTableCell className="py-4 px-6 text-right">
                    <Link to={PATHS.ADMIN_APPLICATION_DETAIL.replace(':id', app.id)}>
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
        </AppCardContent>
      </AppCard>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <span className="text-xs text-zinc-500 font-semibold">
          Hiển thị {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} hồ sơ
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E4DE] bg-white text-zinc-600 disabled:opacity-50 hover:bg-[#FAF9F5] transition-colors"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#0B3025] text-white shadow-sm'
                    : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E4DE] bg-white text-zinc-600 disabled:opacity-50 hover:bg-[#FAF9F5] transition-colors"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-6 md:grid-cols-3 pt-4">
        {/* Total Applications Card */}
        <div className="bg-[#0B3025] shadow-md text-white rounded-2xl p-6 flex flex-col justify-between h-44">
          <span className="text-zinc-300 text-xs font-bold tracking-wide">Tổng số hồ sơ</span>
          <div className="my-2">
            <h2 className="text-5xl font-extrabold tracking-tight">124</h2>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <span>&uarr; +12% so với tháng trước</span>
          </div>
        </div>

        {/* Approval Rate Card */}
        <AppCard className="bg-white border border-[#E5E4DE] shadow-sm rounded-2xl p-6 flex flex-col justify-between h-44">
          <span className="text-zinc-400 text-xs font-bold tracking-wide">Tỷ lệ phê duyệt</span>
          <div className="my-2">
            <h2 className="text-5xl font-extrabold text-[#0B3025] tracking-tight">79%</h2>
          </div>
          <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-[#0B3025] h-full rounded-full" style={{ width: '79%' }} />
          </div>
        </AppCard>

        {/* Active Region Card */}
        <AppCard className="bg-[#FAF9F5] border border-[#E5E4DE] shadow-sm rounded-2xl p-6 flex flex-col justify-between h-44">
          <span className="text-zinc-400 text-xs font-bold tracking-wide">
            Khu vực hoạt động nhất
          </span>
          <div className="my-2">
            <h2 className="text-3xl font-extrabold text-zinc-800 tracking-tight leading-tight">
              Tây Bắc
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500 font-semibold">
            45 hồ sơ từ Lào Cai & Hà Giang
          </span>
        </AppCard>
      </div>
    </div>
  );
}
