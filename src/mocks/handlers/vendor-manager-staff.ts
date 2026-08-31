import { http } from 'msw';
import { fail, ok, page } from '../envelope';

/**
 * Mock cho `vendorStaffService` (`src/features/vendor-manager/staff/services/vendorStaffService.ts`).
 *
 *   GET   /vendor-staff/me            — danh sách nhân viên của vendor hiện tại.
 *   GET   /vendor-staff/coordinators  — chỉ các Coordinator đang hoạt động.
 *   POST  /vendor-staff               — thêm nhân viên (kèm `role` tuỳ chọn).
 *   PUT   /vendor-staff/{id}/status   — khóa/mở khóa.
 *   PATCH /vendor-staff/{id}/role     — chuyển vai trò VENDOR_STAFF ⇄ COORDINATOR.
 */

interface VendorStaffUserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

interface VendorStaffResponseDto {
  vendorStaffId: string;
  vendorId: string;
  user: VendorStaffUserDto;
  isActive: boolean;
  deactivatedAt?: string;
}

const VENDOR_ID = 'vendor-treksphere-1';

let staffList: VendorStaffResponseDto[] = [
  {
    vendorStaffId: 'vstaff-1',
    vendorId: VENDOR_ID,
    user: {
      id: 'user-vendor-staff-1',
      email: 'partner@treksphere.vn',
      fullName: 'Lê Văn Đối Tác',
      avatarUrl: 'https://i.pravatar.cc/150?u=partner-1',
      roles: ['VENDOR_STAFF'],
    },
    isActive: true,
  },
  {
    vendorStaffId: 'vstaff-2',
    vendorId: VENDOR_ID,
    user: {
      id: 'user-coordinator-1',
      email: 'coordinator@treksphere.vn',
      fullName: 'Phạm Thị Điều Phối',
      avatarUrl: 'https://i.pravatar.cc/150?u=coordinator-1',
      roles: ['COORDINATOR'],
    },
    isActive: true,
  },
  {
    vendorStaffId: 'vstaff-3',
    vendorId: VENDOR_ID,
    user: {
      id: 'user-staff-2',
      email: 'ngoc.staff@treksphere.vn',
      fullName: 'Nguyễn Thị Ngọc',
      avatarUrl: 'https://i.pravatar.cc/150?u=staff-2',
      roles: ['VENDOR_STAFF'],
    },
    isActive: true,
  },
  {
    vendorStaffId: 'vstaff-4',
    vendorId: VENDOR_ID,
    user: {
      id: 'user-coordinator-2',
      email: 'hung.coordinator@treksphere.vn',
      fullName: 'Đặng Văn Hùng',
      avatarUrl: 'https://i.pravatar.cc/150?u=coordinator-2',
      roles: ['COORDINATOR'],
    },
    isActive: true,
  },
  {
    vendorStaffId: 'vstaff-5',
    vendorId: VENDOR_ID,
    user: {
      id: 'user-staff-3',
      email: 'binh.staff@treksphere.vn',
      fullName: 'Trịnh Văn Bình',
      avatarUrl: 'https://i.pravatar.cc/150?u=staff-3',
      roles: ['VENDOR_STAFF'],
    },
    isActive: false,
    deactivatedAt: '2026-05-01T02:00:00.000Z',
  },
];

function hasCoordinatorRole(dto: VendorStaffResponseDto): boolean {
  return dto.user.roles.some((role) => role.toUpperCase() === 'COORDINATOR');
}

function matchesKeyword(dto: VendorStaffResponseDto, keyword: string | null): boolean {
  if (!keyword) return true;
  const q = keyword.toLowerCase();
  return dto.user.fullName.toLowerCase().includes(q) || dto.user.email.toLowerCase().includes(q);
}

function respondWithPage(request: Request, source: VendorStaffResponseDto[]) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword');
  const pageParam = Number(url.searchParams.get('page') ?? '0');
  const size = Number(url.searchParams.get('size') ?? '10');
  const filtered = source.filter((item) => matchesKeyword(item, keyword));
  return ok(page(filtered, pageParam, size));
}

export const vendorManagerStaffHandlers = [
  http.get('*/vendor-staff/coordinators', async ({ request }) => {
    return respondWithPage(
      request,
      staffList.filter((item) => hasCoordinatorRole(item) && item.isActive)
    );
  }),

  http.get('*/vendor-staff/me', async ({ request }) => {
    return respondWithPage(request, staffList);
  }),

  http.post('*/vendor-staff', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      fullName?: string;
      role?: 'VENDOR_STAFF' | 'COORDINATOR';
    };
    if (!body.email) {
      return fail('Email là bắt buộc.', 400, [{ field: 'email', message: 'Email là bắt buộc.' }]);
    }
    if (staffList.some((item) => item.user.email.toLowerCase() === body.email!.toLowerCase())) {
      return fail('Nhân viên với email này đã tồn tại.', 409);
    }
    const role = body.role ?? 'VENDOR_STAFF';
    const created: VendorStaffResponseDto = {
      vendorStaffId: `vstaff-${Date.now()}`,
      vendorId: VENDOR_ID,
      user: {
        id: `user-new-${Date.now()}`,
        email: body.email,
        fullName: body.fullName ?? body.email.split('@')[0],
        avatarUrl: `https://i.pravatar.cc/150?u=staff-${Date.now()}`,
        roles: [role],
      },
      isActive: true,
    };
    staffList = [created, ...staffList];
    return ok(created, 'Thêm nhân viên thành công.', 201);
  }),

  http.put('*/vendor-staff/:id/status', async ({ request, params }) => {
    const id = params.id as string;
    const existing = staffList.find((item) => item.vendorStaffId === id);
    if (!existing) {
      return fail('Không tìm thấy nhân viên.', 404);
    }
    const body = (await request.json().catch(() => ({}))) as { isActive?: boolean };
    existing.isActive = body.isActive ?? existing.isActive;
    existing.deactivatedAt = existing.isActive ? undefined : new Date().toISOString();
    return ok(
      existing,
      existing.isActive ? 'Mở khóa nhân viên thành công.' : 'Khóa nhân viên thành công.'
    );
  }),

  http.patch('*/vendor-staff/:id/role', async ({ request, params }) => {
    const id = params.id as string;
    const existing = staffList.find((item) => item.vendorStaffId === id);
    if (!existing) {
      return fail('Không tìm thấy nhân viên.', 404);
    }
    const body = (await request.json().catch(() => ({}))) as {
      role?: 'VENDOR_STAFF' | 'COORDINATOR';
    };
    if (!body.role) {
      return fail('Vai trò là bắt buộc.', 400);
    }
    const otherRoles = existing.user.roles.filter(
      (role) => role.toUpperCase() !== 'VENDOR_STAFF' && role.toUpperCase() !== 'COORDINATOR'
    );
    existing.user.roles = [body.role, ...otherRoles];
    return ok(existing, 'Cập nhật vai trò thành công.');
  }),
];
