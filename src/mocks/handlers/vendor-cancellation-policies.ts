import { http } from 'msw';
import { mockCancellationPolicies } from '../data/tours';
import { fail, ok } from '../envelope';

/**
 * Mock cho `cancellationPolicyService`
 * (`src/features/vendor-cancellation-policies/services/cancellationPolicyService.ts`).
 *
 * Dùng chung `mockCancellationPolicies` với `src/mocks/data/tours.ts` — tour detail
 * (`tours.ts` handler) nhúng cùng danh sách này vào `TourDetailFromApi.cancellationPolicies`,
 * nên sửa/xóa chính sách ở đây phản ánh ngay sang trang chi tiết tour công khai.
 *
 *   GET    /vendor/cancellation-policies       — danh sách chính sách của vendor hiện tại
 *   POST   /vendor/cancellation-policies       — tạo mới (Vendor Manager)
 *   PUT    /vendor/cancellation-policies/:id   — cập nhật (Vendor Manager)
 *   DELETE /vendor/cancellation-policies/:id   — xóa (Vendor Manager)
 */

let policySeq = mockCancellationPolicies.length + 1;

export const vendorCancellationPolicyHandlers = [
  http.get('*/vendor/cancellation-policies', async () => ok(mockCancellationPolicies)),

  http.post('*/vendor/cancellation-policies', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      cancelBeforeDays?: number;
      refundPercentage?: number;
      description?: string;
    };
    if (body.cancelBeforeDays === undefined || body.refundPercentage === undefined) {
      return fail('Vui lòng nhập đầy đủ số ngày hủy và phần trăm hoàn tiền.', 400);
    }
    const created = {
      cancellationPolicyId: `policy-${policySeq++}`,
      cancelBeforeDays: body.cancelBeforeDays,
      refundPercentage: body.refundPercentage,
      description: body.description,
      isActive: true,
    };
    mockCancellationPolicies.push(created);
    return ok(created, 'Tạo chính sách hủy tour thành công.', 201);
  }),

  http.put('*/vendor/cancellation-policies/:id', async ({ request, params }) => {
    const existing = mockCancellationPolicies.find((p) => p.cancellationPolicyId === params.id);
    if (!existing) return fail('Không tìm thấy chính sách hủy tour.', 404);
    const body = (await request.json().catch(() => ({}))) as {
      cancelBeforeDays?: number;
      refundPercentage?: number;
      description?: string;
    };
    if (body.cancelBeforeDays !== undefined) existing.cancelBeforeDays = body.cancelBeforeDays;
    if (body.refundPercentage !== undefined) existing.refundPercentage = body.refundPercentage;
    if (body.description !== undefined) existing.description = body.description;
    return ok(existing, 'Cập nhật chính sách hủy tour thành công.');
  }),

  http.delete('*/vendor/cancellation-policies/:id', async ({ params }) => {
    const index = mockCancellationPolicies.findIndex((p) => p.cancellationPolicyId === params.id);
    if (index === -1) return fail('Không tìm thấy chính sách hủy tour.', 404);
    mockCancellationPolicies.splice(index, 1);
    return ok(null, 'Xóa chính sách hủy tour thành công.');
  }),
];
