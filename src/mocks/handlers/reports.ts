import { http } from 'msw';
import { addReport } from '../data/admin-reports';
import { fail, ok } from '../envelope';

/**
 * `src/features/reports/services/reportService.ts` — trekker gửi báo cáo vi
 * phạm nội dung (blog/comment/review). Khác với `adminReportService`
 * (khu vực admin xử lý report) — endpoint ở đây chỉ có 1 action: tạo report.
 * Report tạo ra được lưu vào cùng kho dữ liệu với `admin.ts` để danh sách
 * report phía admin phản ánh ngay report mới gửi trong phiên demo.
 */
export const reportHandlers = [
  http.post('*/reports', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      targetType?: string;
      targetId?: string;
      reason?: string;
    };

    if (!body.targetType || !body.targetId || !body.reason?.trim()) {
      return fail('Thiếu thông tin báo cáo.', 400, [
        { field: 'reason', message: 'Vui lòng nhập lý do báo cáo.' },
      ]);
    }

    addReport({
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason.trim(),
    });

    return ok(null, 'Gửi báo cáo thành công. Cảm ơn đóng góp của bạn!', 201);
  }),
];
