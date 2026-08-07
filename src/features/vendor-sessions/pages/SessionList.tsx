import { CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPartnerSessionDetailPath,
  getPrimaryRole,
  getVendorManagerSessionDetailPath,
  ROLES,
} from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import { SessionPagination } from '../components/SessionPagination';
import { SessionTableRow } from '../components/SessionTableRow';
import { useVendorSessionList } from '../hooks/useVendorSessionList';
import type { SessionStatus, VendorSessionSummary } from '../types';

const PAGE_SIZE = 10;

const STATUS_TABS: Array<{ value: SessionStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ khởi hành' },
  { value: 'IN_PROGRESS', label: 'Đang diễn ra' },
  { value: 'COMPLETED', label: 'Đã hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const TABLE_COLUMNS = ['Tour', 'Ngày khởi hành → Ngày về', 'Trạng thái', ''];

/** Danh sách phiên Trekking — dùng chung cho Vendor Manager và Vendor Staff, điểm vào của trang Chi tiết phân công. */
export default function SessionList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<SessionStatus | 'ALL'>('ALL');

  const user = useAppStore((state) => state.user);
  const isManager = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;

  const filter = useMemo(
    () => ({ status: statusTab === 'ALL' ? undefined : statusTab }),
    [statusTab]
  );

  const { data, isLoading, isError, error } = useVendorSessionList(filter, page, PAGE_SIZE);

  const sessions = data?.sessions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSelectTab = (value: SessionStatus | 'ALL') => {
    setStatusTab(value);
    setPage(1);
  };

  const handleRowClick = (session: VendorSessionSummary) => {
    const path = isManager
      ? getVendorManagerSessionDetailPath(session.sessionId)
      : getPartnerSessionDetailPath(session.sessionId);
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: '#06261D' }}
        >
          Trek Sessions
        </h2>
        <p className="text-sm font-medium mt-1" style={{ color: '#6F7B75' }}>
          Danh sách các phiên tour — chọn 1 phiên để xem chi tiết phân công nhân sự & trang thiết
          bị.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === statusTab;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleSelectTab(tab.value)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={
                isActive
                  ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                  : { backgroundColor: '#F0EEE6', color: '#6F7B75' }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#06261D' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách phiên tour...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách phiên tour:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarClock className="h-8 w-8" style={{ color: '#C7C1AD' }} />
                      <span className="text-sm" style={{ color: '#6F7B75' }}>
                        Không có phiên tour nào phù hợp.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <SessionTableRow
                    key={session.sessionId}
                    session={session}
                    onClick={handleRowClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {sessions.length > 0 && (
          <SessionPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalCount={total}
            pageSize={PAGE_SIZE}
          />
        )}
      </div>
    </div>
  );
}
