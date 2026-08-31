import { http } from 'msw';
import { findReportById, type MockReport, mockReports } from '../data/admin-reports';
import { findRefundById, type MockRefund, mockRefunds } from '../data/refunds';
import { mockUsers } from '../data/users';
import { fail, ok } from '../envelope';

/**
 * Handlers cho toàn bộ khu vực Admin:
 *  - adminAccountService  → GET/PUT /users*
 *  - adminVendorService   → GET/PUT /vendors, /vendors/{id}/status
 *  - vendorApplicationService → /vendors/applications*
 *  - adminRefundService   → /admin/refunds*
 *  - adminReportService   → /admin/reports* (moderation report, KHÁC report của trekker)
 */

// ---------------------------------------------------------------------------
// Accounts (GET /users, GET /users/{id}, PUT /users/{id}/status)
// ---------------------------------------------------------------------------

interface MockAccount {
  userId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
  emailVerified: boolean;
  roles: string[];
}

const mockAccounts: MockAccount[] = [
  ...mockUsers.map((u) => ({
    userId: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone ?? null,
    dateOfBirth: u.dateOfBirth ?? null,
    gender: (u.gender?.toUpperCase() as MockAccount['gender']) ?? null,
    avatarUrl: u.avatarUrl ?? null,
    status: 'ACTIVE' as const,
    emailVerified: true,
    roles: u.roles,
  })),
  {
    userId: 'user-trekker-2',
    email: 'lan.nguyen@example.com',
    fullName: 'Nguyễn Thị Lan',
    phone: '0911111111',
    dateOfBirth: '2000-02-14',
    gender: 'FEMALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=trekker-2',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['TREKKER'],
  },
  {
    userId: 'user-trekker-3',
    email: 'binh.tran@example.com',
    fullName: 'Trần Văn Bình',
    phone: '0922222222',
    dateOfBirth: '1996-06-06',
    gender: 'MALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=trekker-3',
    status: 'DEACTIVATED',
    emailVerified: true,
    roles: ['TREKKER'],
  },
  {
    userId: 'user-trekker-4',
    email: 'hoa.le@example.com',
    fullName: 'Lê Thị Hoa',
    phone: '0933333333',
    dateOfBirth: '1999-09-09',
    gender: 'FEMALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=trekker-4',
    status: 'ACTIVE',
    emailVerified: false,
    roles: ['TREKKER'],
  },
  {
    userId: 'user-trekker-5',
    email: 'son.hoang@example.com',
    fullName: 'Hoàng Văn Sơn',
    phone: '0987654321',
    dateOfBirth: '1993-03-03',
    gender: 'MALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=trekker-5',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['TREKKER'],
  },
  {
    userId: 'user-vendor-manager-2',
    email: 'manager2@treksphere.vn',
    fullName: 'Đỗ Thị Kim',
    phone: '0944444444',
    dateOfBirth: '1990-04-04',
    gender: 'FEMALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=manager-2',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['VENDOR_MANAGER'],
  },
  {
    userId: 'user-vendor-staff-2',
    email: 'staff2@treksphere.vn',
    fullName: 'Ngô Văn Đức',
    phone: '0955555555',
    dateOfBirth: '1994-05-05',
    gender: 'MALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=staff-2',
    status: 'LOCKED',
    emailVerified: true,
    roles: ['VENDOR_STAFF'],
  },
  {
    userId: 'user-coordinator-2',
    email: 'coordinator2@treksphere.vn',
    fullName: 'Bùi Thị Thu',
    phone: '0966666666',
    dateOfBirth: '1997-07-07',
    gender: 'FEMALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=coordinator-2',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['COORDINATOR'],
  },
  {
    userId: 'user-trekker-6',
    email: 'mai.pham@example.com',
    fullName: 'Phạm Thị Mai',
    phone: '0977777777',
    dateOfBirth: '2001-11-20',
    gender: 'FEMALE',
    avatarUrl: 'https://i.pravatar.cc/150?u=trekker-6',
    status: 'ACTIVE',
    emailVerified: true,
    roles: ['TREKKER'],
  },
];

// ---------------------------------------------------------------------------
// Vendors (GET /vendors, PUT /vendors/{id}/status)
// ---------------------------------------------------------------------------

interface MockVendor {
  vendorId: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  taxCode?: string | null;
  businessLicenseUrl?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
  manager: MockAccount | null;
}

const findAccount = (id: string) => mockAccounts.find((a) => a.userId === id) ?? null;

const mockVendors: MockVendor[] = [
  {
    vendorId: 'vendor-1',
    companyName: 'TrekViet Adventure',
    description: 'Chuyên tổ chức trekking Tây Bắc: Fansipan, Bạch Mộc Lương Tử, Pu Ta Leng.',
    logoUrl: 'https://i.pravatar.cc/150?u=vendor-1-logo',
    contactEmail: 'manager@treksphere.vn',
    contactPhone: '0900000003',
    taxCode: '0109876543',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-vendor-1.pdf',
    status: 'ACTIVE',
    manager: findAccount('user-vendor-manager-1'),
  },
  {
    vendorId: 'vendor-2',
    companyName: 'Sơn Đoòng Explorer',
    description: 'Đối tác độc quyền tour hang động Phong Nha - Kẻ Bàng.',
    logoUrl: 'https://i.pravatar.cc/150?u=vendor-2-logo',
    contactEmail: 'manager2@treksphere.vn',
    contactPhone: '0944444444',
    taxCode: '0108765432',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-vendor-2.pdf',
    status: 'ACTIVE',
    manager: findAccount('user-vendor-manager-2'),
  },
  {
    vendorId: 'vendor-3',
    companyName: 'Tà Năng Trail',
    description: 'Tour trekking đồi cỏ Tà Năng - Phan Dũng.',
    logoUrl: null,
    contactEmail: 'contact@tanangtrail.vn',
    contactPhone: '0988112233',
    taxCode: '0107654321',
    businessLicenseUrl: null,
    status: 'INACTIVE',
    manager: null,
  },
  {
    vendorId: 'vendor-4',
    companyName: 'Langbiang Homestay & Trek',
    description: 'Trekking Langbiang kết hợp homestay bản địa Đà Lạt.',
    logoUrl: null,
    contactEmail: 'contact@langbiangtrek.vn',
    contactPhone: '0977889900',
    taxCode: '0106543210',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-vendor-4.pdf',
    status: 'REVOKED',
    manager: null,
  },
  {
    vendorId: 'vendor-5',
    companyName: 'Fansipan Trek Co.',
    description: 'Chinh phục đỉnh Fansipan qua nhiều cung đường khác nhau.',
    logoUrl: null,
    contactEmail: 'contact@fansipantrek.vn',
    contactPhone: '0966554433',
    taxCode: '0105432109',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-vendor-5.pdf',
    status: 'ACTIVE',
    manager: null,
  },
];

// ---------------------------------------------------------------------------
// Vendor applications (GET/POST/PUT /vendors/applications*)
// ---------------------------------------------------------------------------

interface MockApplication {
  vendorApplicationId: string;
  applicant: { id: string; email: string; fullName: string; avatarUrl?: string; roles: string[] };
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessDescription?: string;
  applicationStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  createdAt: string;
}

const trekkerApplicant = {
  id: 'user-trekker-1',
  email: 'trekker@treksphere.vn',
  fullName: 'Nguyễn Văn Trekker',
  avatarUrl: 'https://i.pravatar.cc/150?u=trekker-1',
  roles: ['TREKKER'],
};

const mockApplications: MockApplication[] = [
  {
    vendorApplicationId: 'app-1',
    applicant: trekkerApplicant,
    companyName: 'Núi Rừng Việt Trek',
    contactEmail: 'trekker@treksphere.vn',
    contactPhone: '0900000002',
    businessDescription: 'Startup tổ chức tour trekking các tỉnh miền núi phía Bắc.',
    applicationStatus: 'PENDING',
    taxCode: '0110001112',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-app-1.pdf',
    createdAt: new Date('2026-08-25T02:00:00Z').toISOString(),
  },
  {
    vendorApplicationId: 'app-2',
    applicant: {
      id: 'user-trekker-2',
      email: 'lan.nguyen@example.com',
      fullName: 'Nguyễn Thị Lan',
      avatarUrl: 'https://i.pravatar.cc/150?u=trekker-2',
      roles: ['TREKKER'],
    },
    companyName: 'Cao Nguyên Đá Trek',
    contactEmail: 'lan.nguyen@example.com',
    contactPhone: '0911111111',
    businessDescription: 'Tổ chức trekking cao nguyên đá Đồng Văn - Hà Giang.',
    applicationStatus: 'APPROVED',
    taxCode: '0110002223',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-app-2.pdf',
    createdAt: new Date('2026-08-01T02:00:00Z').toISOString(),
  },
  {
    vendorApplicationId: 'app-3',
    applicant: {
      id: 'user-trekker-3',
      email: 'binh.tran@example.com',
      fullName: 'Trần Văn Bình',
      avatarUrl: 'https://i.pravatar.cc/150?u=trekker-3',
      roles: ['TREKKER'],
    },
    companyName: 'Miền Tây Xanh Travel',
    contactEmail: 'binh.tran@example.com',
    contactPhone: '0922222222',
    businessDescription: 'Tour sinh thái miền Tây kết hợp trekking rừng tràm.',
    applicationStatus: 'REJECTED',
    rejectionReason: 'Giấy phép kinh doanh không hợp lệ, vui lòng nộp lại bản gốc.',
    taxCode: '0110003334',
    businessLicenseUrl: 'https://res.cloudinary.com/treksphere/mock/license-app-3.pdf',
    createdAt: new Date('2026-07-15T02:00:00Z').toISOString(),
  },
  {
    vendorApplicationId: 'app-4',
    applicant: trekkerApplicant,
    companyName: 'Trek Draft Company',
    contactEmail: 'trekker@treksphere.vn',
    contactPhone: '0900000002',
    businessDescription: 'Bản nháp chưa nộp.',
    applicationStatus: 'DRAFT',
    taxCode: '0110004445',
    createdAt: new Date('2026-08-28T02:00:00Z').toISOString(),
  },
];
let appSeq = mockApplications.length + 1;

function paginateApplications(list: MockApplication[], page: number, size: number) {
  const start = page * size;
  const content = list.slice(start, start + size);
  return {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / size)),
    last: start + size >= list.length,
  };
}

// ---------------------------------------------------------------------------
// Refunds & Reports mappers
// ---------------------------------------------------------------------------

function toRefundTransaction(r: MockRefund) {
  return {
    refundTransactionId: r.refundTransactionId,
    bookingId: r.bookingId,
    paymentTransactionId: r.paymentTransactionId,
    amount: r.amount,
    reason: r.reason,
    reasonDetail: r.reasonDetail ?? null,
    status: r.status,
    refundMethod: r.refundMethod,
    destinationBin: r.destinationBin ?? null,
    destinationAccountNumber: r.destinationAccountNumber ?? null,
    maskedDestinationAccountNumber: r.maskedDestinationAccountNumber ?? null,
    destinationAccountName: r.destinationAccountName ?? null,
    gatewayRefundId: r.gatewayRefundId ?? null,
    manualBankReference: r.manualBankReference ?? null,
    requestedAt: r.requestedAt,
    processingAt: r.processingAt ?? null,
    completedAt: r.completedAt ?? null,
    dueAt: r.dueAt ?? null,
    nextRetryAt: r.nextRetryAt ?? null,
    attemptCount: r.attemptCount ?? 0,
    failureCode: r.failureCode ?? null,
    failureMessage: r.failureMessage ?? null,
    bookingCode: r.bookingCode ?? null,
    vendorName: r.vendorName ?? null,
    automaticPayoutAvailable: r.automaticPayoutAvailable,
    manualReceiptUrl: r.manualReceiptUrl ?? null,
    manualSubmittedAt: r.manualSubmittedAt ?? null,
    adminReviewedAt: r.adminReviewedAt ?? null,
    adminReviewNote: r.adminReviewNote ?? null,
  };
}

function toReportResponse(r: MockReport) {
  return { ...r };
}

function paginateReports(list: MockReport[], page: number, size: number) {
  const start = page * size;
  const content = list.slice(start, start + size).map(toReportResponse);
  return {
    content,
    pageNumber: page,
    pageSize: size,
    totalElements: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / size)),
    last: start + size >= list.length,
  };
}

export const adminHandlers = [
  // ---------------------------------------------------------------------
  // Accounts
  // ---------------------------------------------------------------------
  http.get('*/users', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const roleName = url.searchParams.get('roleName');
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();

    let filtered = [...mockAccounts];
    if (roleName) {
      filtered = filtered.filter((a) => a.roles.some((r) => r.toUpperCase() === roleName));
    }
    if (keyword) {
      filtered = filtered.filter(
        (a) => a.fullName.toLowerCase().includes(keyword) || a.email.toLowerCase().includes(keyword)
      );
    }

    const start = page * size;
    const content = filtered.slice(start, start + size);
    return ok({
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  http.get('*/users/:id', async ({ params }) => {
    const account = mockAccounts.find((a) => a.userId === params.id);
    if (!account) return fail('Không tìm thấy tài khoản.', 404);
    return ok(account);
  }),

  http.put('*/users/:id/status', async ({ params, request }) => {
    const account = mockAccounts.find((a) => a.userId === params.id);
    if (!account) return fail('Không tìm thấy tài khoản.', 404);

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    if (status !== 'ACTIVE' && status !== 'DEACTIVATED') {
      return fail('Chức năng khoá vĩnh viễn chưa được hỗ trợ', 400);
    }
    account.status = status;
    return ok(null, 'Cập nhật trạng thái tài khoản thành công.');
  }),

  // ---------------------------------------------------------------------
  // Vendors
  // ---------------------------------------------------------------------
  http.get('*/vendors/applications/my-history', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');

    let filtered = mockApplications.filter((a) => a.applicant.id === 'user-trekker-1');
    if (status) filtered = filtered.filter((a) => a.applicationStatus === status);

    return ok(paginateApplications(filtered, page, size));
  }),

  http.get('*/vendors/applications/:id', async ({ params }) => {
    const app = mockApplications.find((a) => a.vendorApplicationId === params.id);
    if (!app) return fail('Không tìm thấy đơn đăng ký.', 404);
    return ok(app);
  }),

  http.get('*/vendors/applications', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();

    let filtered = [...mockApplications];
    if (status) filtered = filtered.filter((a) => a.applicationStatus === status);
    if (keyword) {
      filtered = filtered.filter(
        (a) =>
          a.companyName.toLowerCase().includes(keyword) ||
          a.contactEmail.toLowerCase().includes(keyword)
      );
    }

    return ok(paginateApplications(filtered, page, size));
  }),

  http.post('*/vendors/applications', async ({ request }) => {
    const formData = await request.formData();
    const companyName = String(formData.get('companyName') ?? 'Công ty mới');
    const contactEmail = String(formData.get('contactEmail') ?? 'trekker@treksphere.vn');
    const contactPhone = String(formData.get('contactPhone') ?? '');
    const taxCode = formData.get('taxCode');
    const businessDescription = formData.get('businessDescription');

    const app: MockApplication = {
      vendorApplicationId: `app-${appSeq++}`,
      applicant: trekkerApplicant,
      companyName,
      contactEmail,
      contactPhone,
      businessDescription: businessDescription ? String(businessDescription) : undefined,
      applicationStatus: 'DRAFT',
      taxCode: taxCode ? String(taxCode) : undefined,
      businessLicenseUrl: formData.get('businessLicense')
        ? 'https://res.cloudinary.com/treksphere/mock/license-new.pdf'
        : undefined,
      createdAt: new Date().toISOString(),
    };
    mockApplications.unshift(app);

    return ok(app, 'Tạo đơn đăng ký thành công.', 201);
  }),

  http.put('*/vendors/applications/:id', async ({ params, request }) => {
    const app = mockApplications.find((a) => a.vendorApplicationId === params.id);
    if (!app) return fail('Không tìm thấy đơn đăng ký.', 404);

    const formData = await request.formData();
    if (formData.has('companyName')) app.companyName = String(formData.get('companyName'));
    if (formData.has('contactEmail')) app.contactEmail = String(formData.get('contactEmail'));
    if (formData.has('contactPhone')) app.contactPhone = String(formData.get('contactPhone'));
    if (formData.has('taxCode')) app.taxCode = String(formData.get('taxCode'));
    if (formData.has('businessDescription')) {
      app.businessDescription = String(formData.get('businessDescription'));
    }
    if (formData.get('businessLicense')) {
      app.businessLicenseUrl = 'https://res.cloudinary.com/treksphere/mock/license-updated.pdf';
    }

    return ok(app, 'Cập nhật đơn đăng ký thành công.');
  }),

  http.post('*/vendors/applications/:id/submit', async ({ params }) => {
    const app = mockApplications.find((a) => a.vendorApplicationId === params.id);
    if (!app) return fail('Không tìm thấy đơn đăng ký.', 404);
    app.applicationStatus = 'PENDING';
    return ok(app, 'Nộp đơn đăng ký thành công.');
  }),

  http.post('*/vendors/applications/:id/resubmit', async ({ params }) => {
    const app = mockApplications.find((a) => a.vendorApplicationId === params.id);
    if (!app) return fail('Không tìm thấy đơn đăng ký.', 404);
    app.applicationStatus = 'PENDING';
    app.rejectionReason = undefined;
    return ok(app, 'Nộp lại đơn đăng ký thành công.');
  }),

  http.post('*/vendors/applications/:id/review', async ({ params, request }) => {
    const app = mockApplications.find((a) => a.vendorApplicationId === params.id);
    if (!app) return fail('Không tìm thấy đơn đăng ký.', 404);

    const body = (await request.json().catch(() => ({}))) as {
      status?: 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    };
    app.applicationStatus = body.status ?? 'APPROVED';
    app.rejectionReason = body.status === 'REJECTED' ? body.rejectionReason : undefined;

    if (
      app.applicationStatus === 'APPROVED' &&
      !mockVendors.some((v) => v.contactEmail === app.contactEmail)
    ) {
      mockVendors.push({
        vendorId: `vendor-${mockVendors.length + 1}`,
        companyName: app.companyName,
        description: app.businessDescription ?? null,
        logoUrl: null,
        contactEmail: app.contactEmail,
        contactPhone: app.contactPhone,
        taxCode: app.taxCode ?? null,
        businessLicenseUrl: app.businessLicenseUrl ?? null,
        status: 'ACTIVE',
        manager: findAccount(app.applicant.id),
      });
    }

    return ok(app, 'Xử lý đơn đăng ký thành công.');
  }),

  http.get('*/vendors', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();

    let filtered = [...mockVendors];
    if (status) filtered = filtered.filter((v) => v.status === status);
    if (keyword) {
      filtered = filtered.filter(
        (v) =>
          v.companyName.toLowerCase().includes(keyword) ||
          v.contactEmail.toLowerCase().includes(keyword)
      );
    }

    const start = page * size;
    const content = filtered.slice(start, start + size);
    return ok({
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: start + size >= filtered.length,
    });
  }),

  http.put('*/vendors/:id/status', async ({ params, request }) => {
    const vendor = mockVendors.find((v) => v.vendorId === params.id);
    if (!vendor) return fail('Không tìm thấy nhà cung cấp.', 404);

    const body = (await request.json().catch(() => ({}))) as {
      status?: 'ACTIVE' | 'INACTIVE' | 'REVOKED';
    };
    vendor.status = body.status ?? vendor.status;

    return ok(vendor, 'Cập nhật trạng thái nhà cung cấp thành công.');
  }),

  // ---------------------------------------------------------------------
  // Refunds
  // ---------------------------------------------------------------------
  http.get('*/admin/refunds', async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const filtered = status ? mockRefunds.filter((r) => r.status === status) : mockRefunds;
    return ok(filtered.map(toRefundTransaction));
  }),

  http.post('*/admin/refunds/:id/review', async ({ params, request }) => {
    const refund = findRefundById(params.id as string);
    if (!refund) return fail('Không tìm thấy yêu cầu hoàn tiền.', 404);

    const body = (await request.json().catch(() => ({}))) as { approved?: boolean; note?: string };
    refund.adminReviewedAt = new Date().toISOString();
    refund.adminReviewNote = body.note ?? '';

    if (body.approved) {
      refund.status = 'REFUNDED';
      refund.completedAt = new Date().toISOString();
    } else {
      refund.status = 'AWAITING_VENDOR_ACTION';
      refund.failureMessage = body.note || 'Minh chứng chuyển khoản chưa hợp lệ, vui lòng nộp lại.';
    }

    return ok(toRefundTransaction(refund), 'Duyệt yêu cầu hoàn tiền thành công.');
  }),

  // ---------------------------------------------------------------------
  // Content moderation reports (admin/reports — khác trekker POST /reports)
  // ---------------------------------------------------------------------
  http.get('*/admin/reports', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '10');
    const status = url.searchParams.get('status');

    const filtered = status ? mockReports.filter((r) => r.status === status) : mockReports;
    return ok(paginateReports(filtered, page, size));
  }),

  http.get('*/admin/reports/:id', async ({ params }) => {
    const report = findReportById(params.id as string);
    if (!report) return fail('Không tìm thấy báo cáo.', 404);
    return ok(toReportResponse(report));
  }),

  http.put('*/admin/reports/:id/resolve', async ({ params, request }) => {
    const report = findReportById(params.id as string);
    if (!report) return fail('Không tìm thấy báo cáo.', 404);

    const body = (await request.json().catch(() => ({}))) as {
      action?: 'HIDE_CONTENT' | 'WARNING' | 'DISMISS';
      resolutionNotes?: string;
    };
    report.status = body.action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
    report.resolutionNotes = body.resolutionNotes ?? null;
    report.resolvedByFullName = 'Admin TrekSphere';
    report.updatedAt = new Date().toISOString();

    return ok(null, 'Xử lý báo cáo thành công.');
  }),
];
