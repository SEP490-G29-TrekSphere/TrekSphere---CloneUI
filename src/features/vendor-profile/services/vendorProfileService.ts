import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  UpdateVendorProfilePayload,
  VendorProfileDetail,
  VendorProfileStatus,
} from '../types';

/**
 * Service gọi API hồ sơ Vendor hiện tại (Vendor Manager / Vendor Staff).
 *
 *   GET /vendors/profile — xem hồ sơ chi tiết
 *   PUT /vendors/profile — cập nhật hồ sơ (multipart/form-data)
 */

/** Shape thô mà BE trả về trong `data` (VendorProfileResponse). */
interface VendorProfileResponseDto {
  vendorId: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  taxCode?: string | null;
  businessLicenseUrl?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  paymentQrUrl?: string | null;
  status: VendorProfileStatus;
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

function mapProfile(dto: VendorProfileResponseDto): VendorProfileDetail {
  return {
    vendorId: dto.vendorId,
    companyName: dto.companyName,
    description: dto.description ?? undefined,
    logoUrl: dto.logoUrl ?? undefined,
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone ?? undefined,
    taxCode: dto.taxCode ?? undefined,
    businessLicenseUrl: dto.businessLicenseUrl ?? undefined,
    bankAccount: dto.bankAccount ?? undefined,
    bankName: dto.bankName ?? undefined,
    paymentQrUrl: dto.paymentQrUrl ?? undefined,
    status: dto.status,
  };
}

export const vendorProfileService = {
  /** Lấy hồ sơ Vendor hiện tại. */
  async getProfile(): Promise<VendorProfileDetail> {
    const response = await ApiService<VendorProfileResponseDto>('/vendors/profile', 'GET');
    return mapProfile(unwrapResponse(response));
  },

  /**
   * Cập nhật hồ sơ Vendor — multipart/form-data.
   * Chỉ append field nào có giá trị (không đổi thì không gửi field đó),
   * KHÔNG set Content-Type thủ công — axios tự set boundary khi `data` là FormData.
   */
  async updateProfile(payload: UpdateVendorProfilePayload): Promise<VendorProfileDetail> {
    const formData = new FormData();
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.contactEmail !== undefined) formData.append('contactEmail', payload.contactEmail);
    if (payload.contactPhone !== undefined) formData.append('contactPhone', payload.contactPhone);
    if (payload.bankAccount !== undefined) formData.append('bankAccount', payload.bankAccount);
    if (payload.bankName !== undefined) formData.append('bankName', payload.bankName);
    if (payload.paymentQrFile) formData.append('paymentQr', payload.paymentQrFile);

    const response = await ApiService<VendorProfileResponseDto>(
      '/vendors/profile',
      'PUT',
      formData
    );
    return mapProfile(unwrapResponse(response));
  },
};
