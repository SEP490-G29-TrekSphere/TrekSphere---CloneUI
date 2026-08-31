import { http } from 'msw';
import { VENDOR_ID } from '../data/tours';
import { fail, ok } from '../envelope';

/**
 * Mock cho `vendorVoucherService` (`src/features/vendor-vouchers/services/vendorVoucherService.ts`).
 * `POST /vouchers/validate` cũng được `tourService.validateVoucher` (trekker checkout) gọi tới
 * cùng đường dẫn — chỉ khai báo handler MỘT LẦN ở đây, dùng chung cho cả hai luồng gọi.
 *
 *   GET    /vendor/vouchers            — danh sách voucher của vendor hiện tại (lọc + phân trang)
 *   POST   /vendor/vouchers            — tạo voucher mới
 *   PUT    /vendor/vouchers/:id        — cập nhật voucher
 *   DELETE /vendor/vouchers/:id        — xóa/hủy voucher
 *   GET    /vouchers/vendor/:vendorId  — voucher đang active của 1 vendor (trekker xem ở trang checkout)
 *   POST   /vouchers/validate          — kiểm tra tính hợp lệ của mã khi trekker nhập lúc đặt tour
 */

type VoucherDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

interface MockVoucher {
  voucherId: string;
  vendorId: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  validFrom: string;
  validUntil: string;
  usedCount: number;
  maxUsage: number;
  minOrderValue: number;
  status: VoucherStatus;
}

const iso = (d: string) => new Date(d).toISOString();

let mockVouchers: MockVoucher[] = [
  {
    voucherId: 'voucher-1',
    vendorId: VENDOR_ID,
    code: 'TREKKHOIDONG',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    validFrom: iso('2026-08-01T00:00:00Z'),
    validUntil: iso('2026-12-31T23:59:59Z'),
    usedCount: 12,
    maxUsage: 100,
    minOrderValue: 1000000,
    status: 'ACTIVE',
  },
  {
    voucherId: 'voucher-2',
    vendorId: VENDOR_ID,
    code: 'TREK100K',
    discountType: 'FIXED_AMOUNT',
    discountValue: 100000,
    validFrom: iso('2026-07-01T00:00:00Z'),
    validUntil: iso('2026-09-30T23:59:59Z'),
    usedCount: 34,
    maxUsage: 50,
    minOrderValue: 500000,
    status: 'ACTIVE',
  },
  {
    voucherId: 'voucher-3',
    vendorId: VENDOR_ID,
    code: 'FANSIPAN2026',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    validFrom: iso('2026-01-01T00:00:00Z'),
    validUntil: iso('2026-06-30T23:59:59Z'),
    usedCount: 50,
    maxUsage: 50,
    minOrderValue: 2000000,
    status: 'EXPIRED',
  },
  {
    voucherId: 'voucher-4',
    vendorId: VENDOR_ID,
    code: 'VIPTREKKER',
    discountType: 'FIXED_AMOUNT',
    discountValue: 300000,
    validFrom: iso('2026-08-15T00:00:00Z'),
    validUntil: iso('2026-10-15T23:59:59Z'),
    usedCount: 2,
    maxUsage: 20,
    minOrderValue: 3000000,
    status: 'INACTIVE',
  },
];

let voucherSeq = mockVouchers.length + 1;

function matchesFilters(
  v: MockVoucher,
  filters: { discountType?: string | null; status?: string | null; keyword?: string | null }
): boolean {
  if (filters.discountType && v.discountType !== filters.discountType) return false;
  if (filters.status && v.status !== filters.status) return false;
  if (filters.keyword && !v.code.toLowerCase().includes(filters.keyword.toLowerCase()))
    return false;
  return true;
}

function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    last: start + size >= items.length,
  };
}

export const vendorVoucherHandlers = [
  http.get('*/vendor/vouchers', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const filtered = mockVouchers.filter((v) =>
      matchesFilters(v, {
        discountType: url.searchParams.get('discountType'),
        status: url.searchParams.get('status'),
        keyword: url.searchParams.get('keyword'),
      })
    );
    return ok(paginate(filtered, page, size));
  }),

  http.post('*/vendor/vouchers', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      code?: string;
      discountType?: VoucherDiscountType;
      discountValue?: number;
      minOrderValue?: number;
      maxUsage?: number;
      validFrom?: string;
      validUntil?: string;
    };
    if (!body.code || !body.discountType || body.discountValue === undefined) {
      return fail('Thiếu thông tin bắt buộc để tạo mã giảm giá.', 400);
    }
    if (mockVouchers.some((v) => v.code.toUpperCase() === body.code!.toUpperCase())) {
      return fail('Mã giảm giá đã tồn tại.', 409, [
        { field: 'code', message: 'Mã giảm giá đã tồn tại.' },
      ]);
    }
    const created: MockVoucher = {
      voucherId: `voucher-${voucherSeq++}`,
      vendorId: VENDOR_ID,
      code: body.code.toUpperCase(),
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderValue: body.minOrderValue ?? 0,
      maxUsage: body.maxUsage ?? 1,
      validFrom: body.validFrom ?? new Date().toISOString(),
      validUntil: body.validUntil ?? new Date().toISOString(),
      usedCount: 0,
      status: 'ACTIVE',
    };
    mockVouchers = [created, ...mockVouchers];
    return ok(created, 'Tạo mã giảm giá thành công.', 201);
  }),

  http.put('*/vendor/vouchers/:id', async ({ request, params }) => {
    const existing = mockVouchers.find((v) => v.voucherId === params.id);
    if (!existing) return fail('Không tìm thấy mã giảm giá.', 404);
    const body = (await request.json().catch(() => ({}))) as Partial<
      Omit<MockVoucher, 'voucherId' | 'vendorId' | 'code' | 'usedCount'>
    >;
    Object.assign(existing, body);
    return ok(existing, 'Cập nhật mã giảm giá thành công.');
  }),

  http.delete('*/vendor/vouchers/:id', async ({ params }) => {
    const index = mockVouchers.findIndex((v) => v.voucherId === params.id);
    if (index === -1) return fail('Không tìm thấy mã giảm giá.', 404);
    mockVouchers.splice(index, 1);
    return ok(null, 'Xóa mã giảm giá thành công.');
  }),

  http.get('*/vouchers/vendor/:vendorId', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const now = new Date().toISOString();
    const filtered = mockVouchers
      .filter((v) => v.status === 'ACTIVE' && v.validFrom <= now && v.validUntil >= now)
      .filter((v) =>
        matchesFilters(v, {
          discountType: url.searchParams.get('discountType'),
          status: null,
          keyword: url.searchParams.get('keyword'),
        })
      );
    return ok(paginate(filtered, page, size));
  }),

  http.post('*/vouchers/validate', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      code?: string;
      orderValue?: number;
      vendorId?: string;
    };
    const code = body.code?.trim().toUpperCase();
    const voucher = code ? mockVouchers.find((v) => v.code === code) : undefined;
    const now = new Date().toISOString();
    const orderValue = body.orderValue ?? 0;

    if (
      !voucher ||
      voucher.status !== 'ACTIVE' ||
      voucher.validFrom > now ||
      voucher.validUntil < now ||
      voucher.usedCount >= voucher.maxUsage
    ) {
      return fail('Mã giảm giá không hợp lệ hoặc đã hết hạn.', 400);
    }
    if (orderValue < voucher.minOrderValue) {
      return fail(
        `Đơn hàng phải có giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này.`,
        400
      );
    }

    const discountAmount =
      voucher.discountType === 'PERCENTAGE'
        ? Math.round((orderValue * voucher.discountValue) / 100)
        : Math.min(voucher.discountValue, orderValue);

    return ok({ discountAmount, message: 'Áp dụng mã giảm giá thành công.', valid: true });
  }),
];
