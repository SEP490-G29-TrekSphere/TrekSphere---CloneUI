import { ApiService } from '@/config/apiClient';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ReportTargetType = 'BLOG' | 'COMMENT' | 'REVIEW';
export type ReportAction = 'HIDE_CONTENT' | 'WARNING' | 'DISMISS';

export interface ReportResponse {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
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

export interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ReportFilterRequest {
  status?: ReportStatus;
  page?: number;
  size?: number;
}

export interface ResolveReportRequest {
  action: ReportAction;
  resolutionNotes: string;
}

export const adminReportService = {
  getReports: async (filter: ReportFilterRequest): Promise<PaginationResponse<ReportResponse>> => {
    const res = await ApiService<PaginationResponse<ReportResponse>>(
      '/admin/reports',
      'GET',
      undefined,
      filter as Record<string, string>
    );
    if (res.error || (res.status && res.status >= 400)) {
      throw new Error(res.message || res.error || 'Lỗi lấy danh sách báo cáo');
    }
    if (!res.data) throw new Error('Không nhận được dữ liệu');
    return res.data;
  },

  getReportDetail: async (reportId: string): Promise<ReportResponse> => {
    const res = await ApiService<ReportResponse>(`/admin/reports/${reportId}`, 'GET');
    if (res.error || (res.status && res.status >= 400)) {
      throw new Error(res.message || res.error || 'Lỗi lấy chi tiết báo cáo');
    }
    if (!res.data) throw new Error('Không nhận được dữ liệu');
    return res.data;
  },

  resolveReport: async (reportId: string, data: ResolveReportRequest): Promise<void> => {
    const res = await ApiService<void>(`/admin/reports/${reportId}/resolve`, 'PUT', data);
    if (res.error || (res.status && res.status >= 400)) {
      throw new Error(res.message || res.error || 'Lỗi xử lý báo cáo');
    }
  },
};
