import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountFilterDropdown } from '../components/AccountFilterDropdown';
import { AccountPagination } from '../components/AccountPagination';
import { AccountTableRow } from '../components/AccountTableRow';
import { useAdminAccounts } from '../hooks/useAdminAccounts';
import type { AccountRole } from '../types';

const PAGE_SIZE = 10;

/**
 * Trang Quản lý tài khoản — màn chính của Admin.
 *
 * Layout (đồng bộ với màn Tour Approval):
 * - Page header (title + filter).
 * - Bảng dữ liệu (5 cột) trong khối bo góc 24px.
 * - Pagination footer.
 *
 * Thanh search "Tìm kiếm tài khoản..." được đẩy lên Header chung của AdminLayout.
 */
export default function AccountList() {
  const [filterRole, setFilterRole] = useState<AccountRole | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const filter = useMemo(() => ({ role: filterRole, search: '' }), [filterRole]);

  const { data, isLoading, isError, error } = useAdminAccounts(filter, page, PAGE_SIZE);

  const navigate = useNavigate();

  const accounts = data?.accounts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B3025] tracking-tight">
            Quản lý tài khoản
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">
            Xem và quản lý tất cả người dùng trong hệ thống TrekSphere.
          </p>
        </div>

        <AccountFilterDropdown
          value={filterRole}
          onChange={(value) => {
            setFilterRole(value);
            setPage(1);
          }}
        />
      </div>

      {/* Data table */}
      <div
        className="overflow-hidden rounded-3xl bg-card shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Họ và tên
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Email
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Loại tài khoản
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Trạng thái
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách tài khoản...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách tài khoản:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có tài khoản nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <AccountTableRow
                    key={account.id}
                    account={account}
                    onViewDetail={(acc) => navigate(`/admin/accounts/${acc.id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AccountPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
