import { type ApiResponse, ApiService } from '@/config/apiClient';

/**
 * Trạng thái của đơn đăng ký Vendor.
 */
export type ApplicationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Thông tin Applicant (người nộp đơn).
 */
export interface Applicant {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

/**
 * Item Đơn đăng ký Vendor (VendorApplicationResponse).
 */
export interface VendorApplication {
  vendorApplicationId: string;
  applicant: Applicant;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessDescription?: string;
  applicationStatus: ApplicationStatus;
  rejectionReason?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  createdAt: string;
}

export type VendorApplicationDetail = VendorApplication;

/**
 * Payload phân trang trả về từ GET /vendors/applications.
 */
export interface VendorApplicationsResponse {
  content: VendorApplication[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Params lọc và phân trang cho API GET /vendors/applications.
 */
export interface VendorApplicationFilter {
  status?: ApplicationStatus | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

export const vendorApplicationService = {
  /**
   * Lấy danh sách đơn đăng ký với bộ lọc status, search keyword và phân trang (Admin).
   * GET /vendors/applications
   */
  async getApplications(filter: VendorApplicationFilter = {}): Promise<VendorApplicationsResponse> {
    const { status, keyword, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = filter;

    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    };

    if (status && status !== 'ALL') {
      params.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      params.keyword = keyword.trim();
    }

    const response = await ApiService<VendorApplicationsResponse>(
      '/vendors/applications',
      'GET',
      undefined,
      params
    );

    return unwrapResponse(response);
  },

  /**
   * Lấy số liệu thống kê cho các tab/card theo từng trạng thái bằng cách gọi song song
   * GET /vendors/applications?size=1 với từng status.
   */
  async getStats(): Promise<{
    all: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const [allRes, draftRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
      vendorApplicationService.getApplications({ page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'DRAFT', page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'PENDING', page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'APPROVED', page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'REJECTED', page: 0, size: 1 }),
    ]);

    return {
      all: allRes.totalElements ?? 0,
      draft: draftRes.totalElements ?? 0,
      pending: pendingRes.totalElements ?? 0,
      approved: approvedRes.totalElements ?? 0,
      rejected: rejectedRes.totalElements ?? 0,
    };
  },

  /**
   * Lấy chi tiết 1 đơn đăng ký theo ID (Admin & Trekker chính chủ).
   * GET /vendors/applications/{id}
   */
  async getApplicationById(id: string): Promise<VendorApplicationDetail> {
    const response = await ApiService<VendorApplicationDetail>(
      `/vendors/applications/${id}`,
      'GET'
    );
    return unwrapResponse(response);
  },
};
