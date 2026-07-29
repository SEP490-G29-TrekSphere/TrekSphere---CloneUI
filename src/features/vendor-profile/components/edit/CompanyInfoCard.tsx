import { Building2 } from 'lucide-react';

interface CompanyInfoCardProps {
  companyName: string;
  taxCode: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  contactEmail: string;
  onContactEmailChange: (value: string) => void;
  contactPhone: string;
  onContactPhoneChange: (value: string) => void;
}

const inputStyle = { backgroundColor: '#FFFFFF', border: '1px solid #E0DCD1', color: '#06261D' };
const labelStyle = { color: '#6F7B75' };

/**
 * Khối "Thông tin công ty". Tên công ty + MST là readonly (API không hỗ trợ
 * sửa 2 field này — xem spec). Mô tả + Email liên hệ được bổ sung thêm ngoài
 * mockup vì `VendorProfileUpdateRequest` hỗ trợ nhưng mockup không vẽ.
 */
export function CompanyInfoCard({
  companyName,
  taxCode,
  description,
  onDescriptionChange,
  contactEmail,
  onContactEmailChange,
  contactPhone,
  onContactPhoneChange,
}: CompanyInfoCardProps) {
  return (
    <div className="rounded-[32px] p-6 sm:p-8" style={{ backgroundColor: '#F6F4EB' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: '#E6E2D1', color: '#06261D' }}
        >
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#06261D' }}>
            Thông tin công ty
          </h3>
          <p className="text-xs" style={{ color: '#6F7B75' }}>
            Chi tiết pháp lý và liên hệ chính thức
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="companyName"
          >
            Tên công ty / Thương hiệu
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            disabled
            title="Không thể chỉnh sửa — liên hệ Admin để thay đổi tên công ty"
            className="h-11 w-full rounded-xl px-4 text-sm font-medium opacity-70"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="taxCode"
          >
            Mã số thuế (MST)
          </label>
          <input
            id="taxCode"
            type="text"
            value={taxCode}
            disabled
            title="Không thể chỉnh sửa — liên hệ Admin để thay đổi mã số thuế"
            className="h-11 w-full rounded-xl px-4 text-sm font-medium opacity-70"
            style={inputStyle}
          />
        </div>

        <div className="sm:col-span-2">
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="description"
          >
            Mô tả công ty
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            placeholder="Giới thiệu ngắn về công ty của bạn..."
            className="w-full resize-none rounded-xl px-4 py-3 text-sm font-medium outline-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="contactEmail"
          >
            Email liên hệ
          </label>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => onContactEmailChange(e.target.value)}
            placeholder="contact@congty.vn"
            className="h-11 w-full rounded-xl px-4 text-sm font-medium outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold"
            style={labelStyle}
            htmlFor="contactPhone"
          >
            Số điện thoại liên hệ
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => onContactPhoneChange(e.target.value)}
            placeholder="028 3824 1234"
            className="h-11 w-full rounded-xl px-4 text-sm font-medium outline-none"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
