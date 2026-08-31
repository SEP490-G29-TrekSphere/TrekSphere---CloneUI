import { http } from 'msw';
import { ok } from '../envelope';

/**
 * Mock cho `vendorProfileService` (`src/features/vendor-profile/services/vendorProfileService.ts`).
 *
 *   GET /vendors/profile — xem hồ sơ chi tiết Vendor hiện tại.
 *   PUT /vendors/profile — cập nhật hồ sơ (multipart/form-data).
 *
 * Lưu ý: khác `/users/profile` (hồ sơ cá nhân người dùng, xem `auth.ts`) —
 * đây là hồ sơ công ty/doanh nghiệp của Vendor.
 */

type VendorProfileStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';

interface VendorProfileResponseDto {
  vendorId: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  taxCode?: string | null;
  businessLicenseUrl?: string | null;
  status: VendorProfileStatus;
}

let vendorProfile: VendorProfileResponseDto = {
  vendorId: 'vendor-treksphere-1',
  companyName: 'Công ty TNHH Du lịch Trekking Việt',
  description:
    'Đơn vị tổ chức tour trekking chuyên nghiệp tại các cung đường Tây Bắc và Tây Nguyên: Fansipan, Tà Xùa, Bidoup - Núi Bà. Đội ngũ porter và hướng dẫn viên bản địa giàu kinh nghiệm.',
  logoUrl: 'https://i.pravatar.cc/200?u=vendor-treksphere-1',
  contactEmail: 'lienhe@trekkingviet.vn',
  contactPhone: '0281234567',
  taxCode: '0312345678',
  businessLicenseUrl: 'https://picsum.photos/seed/business-license/800/600',
  status: 'ACTIVE',
};

export const vendorProfileHandlers = [
  http.get('*/vendors/profile', async () => ok(vendorProfile)),

  http.put('*/vendors/profile', async ({ request }) => {
    const formData = await request.formData();
    const description = formData.get('description')?.toString();
    const contactEmail = formData.get('contactEmail')?.toString();
    const contactPhone = formData.get('contactPhone')?.toString();
    const hasLogo = formData.has('logo');

    vendorProfile = {
      ...vendorProfile,
      description: description ?? vendorProfile.description,
      contactEmail: contactEmail ?? vendorProfile.contactEmail,
      contactPhone: contactPhone ?? vendorProfile.contactPhone,
      logoUrl: hasLogo
        ? `https://i.pravatar.cc/200?u=vendor-logo-${Date.now()}`
        : vendorProfile.logoUrl,
    };

    return ok(vendorProfile, 'Cập nhật hồ sơ vendor thành công.');
  }),
];
