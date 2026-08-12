import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { toast } from '@/store/useToastStore';
import { CompanyInfoCard } from '../components/edit/CompanyInfoCard';
import { useUpdateVendorProfile } from '../hooks/useUpdateVendorProfile';
import { useVendorProfile } from '../hooks/useVendorProfile';

/**
 * Trang "Chi tiết hồ sơ" — Vendor Manager cập nhật thông tin công ty và liên hệ.
 */
export default function VendorProfileEdit() {
  const navigate = useNavigate();
  const { data: profile, isLoading, isError, error } = useVendorProfile();
  const updateMutation = useUpdateVendorProfile();

  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Nạp giá trị hiện tại khi profile tải xong.
  useEffect(() => {
    if (!profile) return;
    setDescription(profile.description ?? '');
    setContactEmail(profile.contactEmail ?? '');
    setContactPhone(profile.contactPhone ?? '');
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        description,
        contactEmail,
        contactPhone,
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật hồ sơ thành công!');
          navigate(PATHS.VENDOR_MANAGER_PROFILE);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: '#6F7B75' }}>
        Đang tải hồ sơ nhà cung cấp...
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: '#DC2626' }}>
        Không thể tải hồ sơ nhà cung cấp:{' '}
        {error instanceof Error ? error.message : 'Lỗi không xác định'}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: '#06261D' }}
        >
          Chi tiết hồ sơ
        </h2>
        <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
          Cập nhật thông tin giới thiệu và kênh liên hệ của doanh nghiệp.
        </p>
      </div>

      <CompanyInfoCard
        companyName={profile.companyName}
        taxCode={profile.taxCode ?? 'Chưa cập nhật'}
        description={description}
        onDescriptionChange={setDescription}
        contactEmail={contactEmail}
        onContactEmailChange={setContactEmail}
        contactPhone={contactPhone}
        onContactPhoneChange={setContactPhone}
      />

      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          type="button"
          onClick={() => navigate(PATHS.VENDOR_MANAGER_PROFILE)}
          className="rounded-full px-6 py-2.5 text-sm font-semibold transition-colors"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #C5C0B0', color: '#6F7B75' }}
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="rounded-full px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
        >
          {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}
