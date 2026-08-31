import { http } from 'msw';
import { fail, ok, page } from '../envelope';

/**
 * Mock cho `vendorPorterService` (`src/features/vendor-porters/services/vendorPorterService.ts`).
 *
 *   GET    /vendor/porters      — danh sách hồ sơ porter, phân trang + tìm kiếm (keyword).
 *   GET    /vendor/porters/list — toàn bộ hồ sơ porter, không phân trang.
 *   POST   /vendor/porters      — tạo hồ sơ porter mới (multipart/form-data).
 *   PUT    /vendor/porters/{id} — sửa hồ sơ porter (multipart/form-data).
 *   DELETE /vendor/porters/{id} — xóa mềm hồ sơ porter.
 */

type PorterGender = 'MALE' | 'FEMALE' | 'OTHER';
type PorterStatus = 'ACTIVE' | 'INACTIVE';

interface PorterProfileDto {
  porterId: string;
  fullName: string;
  phone: string;
  gender?: PorterGender;
  dateOfBirth?: string;
  address?: string;
  avatarUrl?: string;
  joinedDate?: string;
  status: PorterStatus;
}

let porters: PorterProfileDto[] = [
  {
    porterId: 'porter-1',
    fullName: 'Giàng A Chua',
    phone: '0912345671',
    gender: 'MALE',
    dateOfBirth: '1990-04-12',
    address: 'Sa Pa, Lào Cai',
    avatarUrl: 'https://i.pravatar.cc/150?u=porter-1',
    joinedDate: '2023-03-01',
    status: 'ACTIVE',
  },
  {
    porterId: 'porter-2',
    fullName: 'Lý Thị Mai',
    phone: '0912345672',
    gender: 'FEMALE',
    dateOfBirth: '1995-08-22',
    address: 'Tả Van, Sa Pa',
    avatarUrl: 'https://i.pravatar.cc/150?u=porter-2',
    joinedDate: '2023-06-15',
    status: 'ACTIVE',
  },
  {
    porterId: 'porter-3',
    fullName: 'Sùng A Páo',
    phone: '0912345673',
    gender: 'MALE',
    dateOfBirth: '1988-01-05',
    address: 'Mù Cang Chải, Yên Bái',
    avatarUrl: 'https://i.pravatar.cc/150?u=porter-3',
    joinedDate: '2022-11-20',
    status: 'ACTIVE',
  },
  {
    porterId: 'porter-4',
    fullName: 'Vàng Seo Sáng',
    phone: '0912345674',
    gender: 'MALE',
    dateOfBirth: '1993-09-30',
    address: 'Bắc Hà, Lào Cai',
    avatarUrl: 'https://i.pravatar.cc/150?u=porter-4',
    joinedDate: '2024-01-10',
    status: 'INACTIVE',
  },
  {
    porterId: 'porter-5',
    fullName: 'Hoàng Thị Mến',
    phone: '0912345675',
    gender: 'FEMALE',
    dateOfBirth: '1997-12-02',
    address: 'Đà Lạt, Lâm Đồng',
    avatarUrl: 'https://i.pravatar.cc/150?u=porter-5',
    joinedDate: '2024-05-05',
    status: 'ACTIVE',
  },
];

function matchesKeyword(item: PorterProfileDto, keyword: string | null): boolean {
  if (!keyword) return true;
  const q = keyword.toLowerCase();
  return item.fullName.toLowerCase().includes(q) || item.phone.includes(q);
}

async function parsePorterFormData(request: Request) {
  const formData = await request.formData();
  return {
    fullName: formData.get('fullName')?.toString(),
    phone: formData.get('phone')?.toString(),
    status: formData.get('status')?.toString() as PorterStatus | undefined,
    avatarUrl: formData.get('avatarUrl')?.toString(),
    hasAvatarFile: formData.has('avatarFile'),
  };
}

export const vendorPorterHandlers = [
  http.get('*/vendor/porters/list', async ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    const filtered = porters.filter((item) => matchesKeyword(item, keyword));
    return ok(filtered);
  }),

  http.get('*/vendor/porters', async ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    const pageParam = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const filtered = porters.filter((item) => matchesKeyword(item, keyword));
    return ok(page(filtered, pageParam, size));
  }),

  http.post('*/vendor/porters', async ({ request }) => {
    const parsed = await parsePorterFormData(request);
    if (!parsed.fullName || !parsed.phone) {
      return fail('Họ tên và số điện thoại là bắt buộc.', 400);
    }
    const created: PorterProfileDto = {
      porterId: `porter-${Date.now()}`,
      fullName: parsed.fullName,
      phone: parsed.phone,
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().slice(0, 10),
      avatarUrl: parsed.hasAvatarFile
        ? `https://i.pravatar.cc/150?u=porter-${Date.now()}`
        : parsed.avatarUrl,
    };
    porters = [created, ...porters];
    return ok(created, 'Tạo hồ sơ porter thành công.', 201);
  }),

  http.put('*/vendor/porters/:id', async ({ request, params }) => {
    const id = params.id as string;
    const existing = porters.find((item) => item.porterId === id);
    if (!existing) {
      return fail('Không tìm thấy hồ sơ porter.', 404);
    }
    const parsed = await parsePorterFormData(request);
    existing.fullName = parsed.fullName ?? existing.fullName;
    existing.phone = parsed.phone ?? existing.phone;
    existing.status = parsed.status ?? existing.status;
    if (parsed.hasAvatarFile) {
      existing.avatarUrl = `https://i.pravatar.cc/150?u=porter-${Date.now()}`;
    } else if (parsed.avatarUrl) {
      existing.avatarUrl = parsed.avatarUrl;
    }
    return ok(existing, 'Cập nhật hồ sơ porter thành công.');
  }),

  http.delete('*/vendor/porters/:id', async ({ params }) => {
    const id = params.id as string;
    const existing = porters.find((item) => item.porterId === id);
    if (!existing) {
      return fail('Không tìm thấy hồ sơ porter.', 404);
    }
    porters = porters.filter((item) => item.porterId !== id);
    return ok(null, 'Xóa hồ sơ porter thành công.');
  }),
];
