import { http } from 'msw';
import { fail, ok, page } from '../envelope';

/**
 * Mock cho `vendorEquipmentService` (`src/features/vendor-equipment/services/vendorEquipmentService.ts`).
 *
 *   GET    /vendor/equipments      — danh sách dụng cụ, phân trang + tìm kiếm (keyword).
 *   GET    /vendor/equipments/list — toàn bộ dụng cụ, không phân trang.
 *   POST   /vendor/equipments      — thêm dụng cụ mới.
 *   PUT    /vendor/equipments/{id} — sửa dụng cụ.
 *   DELETE /vendor/equipments/{id} — xóa dụng cụ.
 */

interface VendorEquipmentDto {
  equipmentId: string;
  vendorId: string;
  equipmentName: string;
  description?: string;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

const VENDOR_ID = 'vendor-treksphere-1';

let equipments: VendorEquipmentDto[] = [
  {
    equipmentId: 'equip-1',
    vendorId: VENDOR_ID,
    equipmentName: 'Lều cắm trại 4 người',
    description: 'Lều chống nước 2 lớp, phù hợp trekking Fansipan, Tà Xùa.',
    totalQuantity: 25,
    createdAt: '2026-01-10T02:00:00.000Z',
    updatedAt: '2026-06-01T02:00:00.000Z',
  },
  {
    equipmentId: 'equip-2',
    vendorId: VENDOR_ID,
    equipmentName: 'Túi ngủ giữ nhiệt -5°C',
    description: 'Túi ngủ lông vũ tổng hợp, gọn nhẹ.',
    totalQuantity: 40,
    createdAt: '2026-01-10T02:00:00.000Z',
    updatedAt: '2026-05-15T02:00:00.000Z',
  },
  {
    equipmentId: 'equip-3',
    vendorId: VENDOR_ID,
    equipmentName: 'Dây leo núi 10mm',
    description: 'Dây tĩnh chuyên dụng cho đoạn dốc đá, dài 50m.',
    totalQuantity: 15,
    createdAt: '2026-02-02T02:00:00.000Z',
    updatedAt: '2026-02-02T02:00:00.000Z',
  },
  {
    equipmentId: 'equip-4',
    vendorId: VENDOR_ID,
    equipmentName: 'Bếp gas mini dã ngoại',
    description: 'Bếp cồn/gas mini, kèm bình gas dự phòng.',
    totalQuantity: 18,
    createdAt: '2026-02-15T02:00:00.000Z',
    updatedAt: '2026-02-15T02:00:00.000Z',
  },
  {
    equipmentId: 'equip-5',
    vendorId: VENDOR_ID,
    equipmentName: 'Gậy trekking nhôm (đôi)',
    description: 'Gậy 3 khúc, có thể điều chỉnh độ dài.',
    totalQuantity: 60,
    createdAt: '2026-03-01T02:00:00.000Z',
    updatedAt: '2026-04-20T02:00:00.000Z',
  },
  {
    equipmentId: 'equip-6',
    vendorId: VENDOR_ID,
    equipmentName: 'Đèn pin đội đầu',
    description: undefined,
    totalQuantity: 50,
    createdAt: '2026-03-10T02:00:00.000Z',
    updatedAt: '2026-03-10T02:00:00.000Z',
  },
];

function matchesKeyword(item: VendorEquipmentDto, keyword: string | null): boolean {
  if (!keyword) return true;
  const q = keyword.toLowerCase();
  return (
    item.equipmentName.toLowerCase().includes(q) ||
    (item.description ?? '').toLowerCase().includes(q)
  );
}

export const vendorEquipmentHandlers = [
  http.get('*/vendor/equipments/list', async ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    const filtered = equipments.filter((item) => matchesKeyword(item, keyword));
    return ok(filtered);
  }),

  http.get('*/vendor/equipments', async ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');
    const pageParam = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const filtered = equipments.filter((item) => matchesKeyword(item, keyword));
    return ok(page(filtered, pageParam, size));
  }),

  http.post('*/vendor/equipments', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      equipmentName?: string;
      description?: string;
      totalQuantity?: number;
    };
    if (!body.equipmentName) {
      return fail('Tên dụng cụ là bắt buộc.', 400, [
        { field: 'equipmentName', message: 'Tên dụng cụ là bắt buộc.' },
      ]);
    }
    const now = new Date().toISOString();
    const created: VendorEquipmentDto = {
      equipmentId: `equip-${Date.now()}`,
      vendorId: VENDOR_ID,
      equipmentName: body.equipmentName,
      description: body.description,
      totalQuantity: body.totalQuantity ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    equipments = [created, ...equipments];
    return ok(created, 'Thêm dụng cụ thành công.', 201);
  }),

  http.put('*/vendor/equipments/:id', async ({ request, params }) => {
    const id = params.id as string;
    const existing = equipments.find((item) => item.equipmentId === id);
    if (!existing) {
      return fail('Không tìm thấy dụng cụ.', 404);
    }
    const body = (await request.json().catch(() => ({}))) as {
      equipmentName?: string;
      description?: string;
      totalQuantity?: number;
    };
    existing.equipmentName = body.equipmentName ?? existing.equipmentName;
    existing.description = body.description;
    existing.totalQuantity = body.totalQuantity ?? existing.totalQuantity;
    existing.updatedAt = new Date().toISOString();
    return ok(existing, 'Cập nhật dụng cụ thành công.');
  }),

  http.delete('*/vendor/equipments/:id', async ({ params }) => {
    const id = params.id as string;
    const existing = equipments.find((item) => item.equipmentId === id);
    if (!existing) {
      return fail('Không tìm thấy dụng cụ.', 404);
    }
    equipments = equipments.filter((item) => item.equipmentId !== id);
    return ok(null, 'Xóa dụng cụ thành công.');
  }),
];
