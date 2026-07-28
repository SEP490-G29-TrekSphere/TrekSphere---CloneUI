import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { PorterForm, type PorterFormSubmitValues } from '../components/PorterForm';
import { useVendorPorterMutations } from '../hooks/useVendorPorterMutations';
import type { VendorPorterItem } from '../types';

/**
 * Trang Sửa hồ sơ Porter — dùng chung cho Vendor Manager và Vendor Staff.
 *
 * BE không có `GET /vendor/porters/{id}` đơn lẻ, nên dữ liệu porter phải được
 * truyền qua router state khi điều hướng từ danh sách (xem `PorterList.tsx`).
 * Nếu vào thẳng URL này mà không có state (F5, dán link) thì quay lại danh sách.
 */
export default function PorterEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAppStore((state) => state.user);
  const isManager = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;
  const listPath = isManager ? PATHS.VENDOR_MANAGER_PORTERS : PATHS.PARTNER_PORTERS;

  const porter = (location.state as { porter?: VendorPorterItem } | null)?.porter;
  const { updatePorter } = useVendorPorterMutations();

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần chạy 1 lần khi thiếu state
  useEffect(() => {
    if (!porter) {
      toast.error('Vui lòng chọn "Sửa" từ danh sách porter.');
      navigate(listPath, { replace: true });
    }
  }, []);

  if (!porter || !id) return null;

  const handleSubmit = (values: PorterFormSubmitValues) => {
    updatePorter.mutate(
      {
        id,
        payload: {
          fullName: values.fullName,
          phone: values.phone,
          status: values.status ?? porter.status,
          avatarFile: values.avatarFile,
          avatarUrl: values.avatarFile ? undefined : porter.avatarUrl,
        },
      },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật hồ sơ porter.');
          navigate(listPath);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ porter.'),
      }
    );
  };

  return (
    <PorterForm
      mode="edit"
      listPath={listPath}
      defaultValues={{
        fullName: porter.fullName,
        phone: porter.phone,
        avatarUrl: porter.avatarUrl,
        status: porter.status,
      }}
      isSubmitting={updatePorter.isPending}
      onCancel={() => navigate(listPath)}
      onSubmit={handleSubmit}
    />
  );
}
