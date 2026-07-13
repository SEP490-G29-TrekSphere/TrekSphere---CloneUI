import type { AdminAccount, AdminAccountFilter, AdminAccountsResponse } from '../types';
import type { AdminAccountDetail } from '../types.detail';

/**
 * Service gọi API liên quan tới quản lý tài khoản (khu vực admin).
 *
 * Hiện tại dùng mock data để dựng UI trước khi BE sẵn sàng.
 * Sau này sẽ chuyển sang gọi endpoint thật, vd:
 *   GET /api/v1/admin/accounts?page=&pageSize=&role=&search=
 */

const MOCK_ACCOUNTS: AdminAccount[] = [
  {
    id: 'acc-001',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=11',
    role: 'trekker',
    status: 'ACTIVE',
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: 'acc-002',
    fullName: 'Trần Thị Bình',
    email: 'binh.tran@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=47',
    role: 'vendor_manager',
    status: 'ACTIVE',
    createdAt: '2024-01-10T10:30:00Z',
  },
  {
    id: 'acc-003',
    fullName: 'Lê Hoàng Cường',
    email: 'cuong.le@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=33',
    role: 'vendor_staff',
    status: 'ACTIVE',
    createdAt: '2024-02-22T13:45:00Z',
  },
  {
    id: 'acc-004',
    fullName: 'Phạm Thị Dung',
    email: 'dung.pham@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=49',
    role: 'trekker',
    status: 'LOCKED',
    createdAt: '2024-04-05T09:15:00Z',
  },
  {
    id: 'acc-005',
    fullName: 'Hoàng Minh Đức',
    email: 'duc.hoang@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=14',
    role: 'admin',
    status: 'ACTIVE',
    createdAt: '2023-11-20T11:00:00Z',
  },
  {
    id: 'acc-006',
    fullName: 'Vũ Thị Hà',
    email: 'ha.vu@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=45',
    role: 'trekker',
    status: 'ACTIVE',
    createdAt: '2024-05-12T14:00:00Z',
  },
  {
    id: 'acc-007',
    fullName: 'Đặng Quốc Huy',
    email: 'huy.dang@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=15',
    role: 'vendor_staff',
    status: 'LOCKED',
    createdAt: '2024-03-01T07:30:00Z',
  },
  {
    id: 'acc-008',
    fullName: 'Bùi Thị Lan',
    email: 'lan.bui@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=44',
    role: 'trekker',
    status: 'ACTIVE',
    createdAt: '2024-06-18T16:20:00Z',
  },
  {
    id: 'acc-009',
    fullName: 'Ngô Văn Nam',
    email: 'nam.ngo@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=12',
    role: 'vendor_manager',
    status: 'ACTIVE',
    createdAt: '2024-02-08T12:00:00Z',
  },
  {
    id: 'acc-010',
    fullName: 'Đỗ Thị Oanh',
    email: 'oanh.do@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=48',
    role: 'trekker',
    status: 'ACTIVE',
    createdAt: '2024-07-02T10:10:00Z',
  },
  {
    id: 'acc-011',
    fullName: 'Phan Văn Phúc',
    email: 'phuc.phan@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=13',
    role: 'vendor_staff',
    status: 'ACTIVE',
    createdAt: '2024-01-25T09:00:00Z',
  },
  {
    id: 'acc-012',
    fullName: 'Lý Thị Quỳnh',
    email: 'quynh.ly@treksphere.com',
    avatarUrl: 'https://i.pravatar.cc/120?img=46',
    role: 'trekker',
    status: 'LOCKED',
    createdAt: '2024-04-19T15:30:00Z',
  },
];

/** Tổng số account trong hệ thống (dùng để hiển thị pagination). */
const TOTAL_ACCOUNTS = 120;

/**
 * Mock: lấy danh sách accounts với filter + pagination.
 * Sẽ được thay thế bằng call API thật khi BE sẵn sàng.
 */
export const adminAccountService = {
  async listAccounts(
    filter: AdminAccountFilter = {},
    page = 1,
    pageSize = 4
  ): Promise<AdminAccountsResponse> {
    // Giả lập network delay nhỏ để test loading state
    await new Promise((resolve) => setTimeout(resolve, 150));

    let accounts = [...MOCK_ACCOUNTS];

    if (filter.role && filter.role !== 'ALL') {
      accounts = accounts.filter((a) => a.role === filter.role);
    }

    if (filter.search) {
      const keyword = filter.search.toLowerCase();
      accounts = accounts.filter(
        (a) => a.fullName.toLowerCase().includes(keyword) || a.email.toLowerCase().includes(keyword)
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = accounts.slice(start, end);

    return {
      accounts: paged,
      total: accounts.length > 0 ? TOTAL_ACCOUNTS : 0,
      page,
      pageSize,
    };
  },

  /**
   * Stub: lấy chi tiết 1 account.
   * TODO: thay bằng `GET /admin/accounts/:id` khi BE có.
   */
  async getAccountById(id: string): Promise<AdminAccount | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_ACCOUNTS.find((a) => a.id === id) ?? null;
  },

  /**
   * Mock: khóa tài khoản.
   * TODO: thay bằng `PATCH /admin/accounts/:id/lock` khi BE có.
   */
  async lockAccount(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const account = MOCK_ACCOUNTS.find((a) => a.id === id);
    if (!account) throw new Error('Không tìm thấy tài khoản');
    account.status = 'LOCKED';
  },

  /**
   * Mock: mở khóa tài khoản.
   * TODO: thay bằng `PATCH /admin/accounts/:id/unlock` khi BE có.
   */
  async unlockAccount(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const account = MOCK_ACCOUNTS.find((a) => a.id === id);
    if (!account) throw new Error('Không tìm thấy tài khoản');
    account.status = 'ACTIVE';
  },

  /**
   * Mock: thu hồi giấy phép (hạ role xuống trekker).
   * TODO: thay bằng `PATCH /admin/accounts/:id/revoke` khi BE có.
   */
  async revokeLicense(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const account = MOCK_ACCOUNTS.find((a) => a.id === id);
    if (!account) throw new Error('Không tìm thấy tài khoản');
    if (account.role === 'trekker')
      throw new Error('Tài khoản Trekker không có giấy phép để thu hồi');
    account.role = 'trekker';
  },

  /**
   * Mock: chi tiết đầy đủ 1 account (mở rộng AdminAccount với stats).
   */
  async getAccountDetailById(id: string): Promise<AdminAccountDetail | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const base = MOCK_ACCOUNTS.find((a) => a.id === id);
    if (!base) return null;

    const mockDetails: Record<string, AdminAccountDetail> = {
      'acc-001': {
        ...base,
        phone: '0912 345 678',
        address: 'Số 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        toursJoined: 24,
        toursJoinedGrowth: 3,
        totalSpent: 18_500_000,
        averageRating: 4.9,
        reviewCount: 12,
        lastLocation: { lat: 22.8232, lng: 104.9844, label: 'Hà Giang, Việt Nam' },
      },
      'acc-002': {
        ...base,
        phone: '0987 654 321',
        address: 'Số 45 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
        toursJoined: 8,
        toursJoinedGrowth: 1,
        totalSpent: 6_200_000,
        averageRating: 4.7,
        reviewCount: 5,
        lastLocation: { lat: 21.0285, lng: 105.8542, label: 'Lào Cai, Việt Nam' },
      },
      'acc-003': {
        ...base,
        phone: '0901 234 567',
        address: 'Số 78 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
        toursJoined: 15,
        toursJoinedGrowth: 2,
        totalSpent: 12_800_000,
        averageRating: 4.6,
        reviewCount: 8,
        lastLocation: { lat: 21.0067, lng: 105.8677, label: 'Ninh Bình, Việt Nam' },
      },
    };

    const detail = mockDetails[id];
    if (detail) return detail;

    return {
      ...base,
      phone: '0900 123 456',
      address: 'Địa chỉ chưa cập nhật',
      toursJoined: 5,
      toursJoinedGrowth: 0,
      totalSpent: 3_500_000,
      averageRating: 4.2,
      reviewCount: 3,
      lastLocation: { lat: 21.0285, lng: 105.8542, label: 'Hà Nội, Việt Nam' },
    };
  },
};
