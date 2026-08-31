/**
 * Dữ liệu "báo cáo vi phạm nội dung" (blog/bình luận/đánh giá) dùng chung cho:
 *  - `reports.ts` (trekker gửi báo cáo mới — POST /reports)
 *  - `admin.ts` (`adminReportService` — GET/PUT /admin/reports)
 *
 * LƯU Ý: khác với `adminRefundService`/`vendorApplicationService`, đây KHÔNG
 * phải "admin dashboard stats" mà là moderation report của Trekker Community.
 */

export type MockReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type MockReportTargetType = 'BLOG' | 'COMMENT' | 'REVIEW';
export type MockReportAction = 'HIDE_CONTENT' | 'WARNING' | 'DISMISS';

export interface MockReport {
  id: string;
  targetType: MockReportTargetType;
  targetId: string;
  reason: string;
  status: MockReportStatus;
  reporterFullName: string;
  reporterEmail: string;
  reporterAvatar: string | null;
  targetTitle: string | null;
  targetContent: string | null;
  resolutionNotes: string | null;
  resolvedByFullName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

const iso = (d: string) => new Date(d).toISOString();

export const mockReports: MockReport[] = [
  {
    id: 'report-1',
    targetType: 'BLOG',
    targetId: 'blog-101',
    reason: 'Nội dung chứa thông tin sai lệch về tuyến trekking, gây nguy hiểm cho người đọc.',
    status: 'PENDING',
    reporterFullName: 'Nguyễn Văn Trekker',
    reporterEmail: 'trekker@treksphere.vn',
    reporterAvatar: 'https://i.pravatar.cc/150?u=trekker-1',
    targetTitle: 'Kinh nghiệm leo Fansipan không cần porter',
    targetContent: 'Bài viết hướng dẫn tự leo Fansipan mà không mang đủ trang bị an toàn...',
    resolutionNotes: null,
    resolvedByFullName: null,
    createdAt: iso('2026-08-20T03:00:00Z'),
    updatedAt: null,
  },
  {
    id: 'report-2',
    targetType: 'COMMENT',
    targetId: 'comment-552',
    reason: 'Bình luận có ngôn từ xúc phạm thành viên khác trong nhóm.',
    status: 'RESOLVED',
    reporterFullName: 'Đặng Thị Hồng',
    reporterEmail: 'hong.dang@example.com',
    reporterAvatar: null,
    targetTitle: null,
    targetContent: 'Đồ ngu, đi trek mà không biết gì cả...',
    resolutionNotes: 'Đã ẩn bình luận và cảnh cáo tài khoản vi phạm.',
    resolvedByFullName: 'Admin TrekSphere',
    createdAt: iso('2026-08-10T07:30:00Z'),
    updatedAt: iso('2026-08-11T02:00:00Z'),
  },
  {
    id: 'report-3',
    targetType: 'REVIEW',
    targetId: 'review-77',
    reason: 'Đánh giá spam quảng cáo dịch vụ không liên quan.',
    status: 'DISMISSED',
    reporterFullName: 'Hoàng Văn Sơn',
    reporterEmail: 'son.hoang@example.com',
    reporterAvatar: null,
    targetTitle: 'Đánh giá tour Tà Năng - Phan Dũng',
    targetContent: 'Tour ok, tiện thể ghé shop abc.com mua đồ trek giảm giá 50%...',
    resolutionNotes: 'Kiểm tra không thấy vi phạm nghiêm trọng, chỉ nhắc nhở.',
    resolvedByFullName: 'Admin TrekSphere',
    createdAt: iso('2026-08-05T04:00:00Z'),
    updatedAt: iso('2026-08-06T01:00:00Z'),
  },
  {
    id: 'report-4',
    targetType: 'BLOG',
    targetId: 'blog-118',
    reason: 'Đăng lại bài viết của người khác mà không ghi nguồn (đạo văn).',
    status: 'PENDING',
    reporterFullName: 'Phạm Thị Mai',
    reporterEmail: 'mai.pham@example.com',
    reporterAvatar: null,
    targetTitle: 'Top 5 cung trek đẹp nhất miền Bắc',
    targetContent: 'Bài viết tổng hợp các cung đường trekking đẹp...',
    resolutionNotes: null,
    resolvedByFullName: null,
    createdAt: iso('2026-08-27T08:00:00Z'),
    updatedAt: null,
  },
];

let reportCounter = mockReports.length + 1;

export function findReportById(id: string): MockReport | undefined {
  return mockReports.find((r) => r.id === id);
}

export function addReport(input: {
  targetType: string;
  targetId: string;
  reason: string;
}): MockReport {
  const report: MockReport = {
    id: `report-${reportCounter++}`,
    targetType: (['BLOG', 'COMMENT', 'REVIEW'].includes(input.targetType)
      ? input.targetType
      : 'BLOG') as MockReportTargetType,
    targetId: input.targetId,
    reason: input.reason,
    status: 'PENDING',
    reporterFullName: 'Nguyễn Văn Trekker',
    reporterEmail: 'trekker@treksphere.vn',
    reporterAvatar: 'https://i.pravatar.cc/150?u=trekker-1',
    targetTitle: null,
    targetContent: null,
    resolutionNotes: null,
    resolvedByFullName: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  };
  mockReports.unshift(report);
  return report;
}
