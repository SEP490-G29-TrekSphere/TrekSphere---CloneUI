import { useNavigate } from 'react-router-dom';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { PorterForm, type PorterFormSubmitValues } from '../components/PorterForm';
import { useVendorPorterMutations } from '../hooks/useVendorPorterMutations';

/** Trang Tạo hồ sơ Porter mới — dùng chung cho Vendor Manager và Vendor Staff. */
export default function PorterCreate() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const isManager = getPrimaryRole(user?.roles) === ROLES.VENDOR_MANAGER;
  const listPath = isManager ? PATHS.VENDOR_MANAGER_PORTERS : PATHS.PARTNER_PORTERS;

  const { createPorter } = useVendorPorterMutations();

  const handleSubmit = (values: PorterFormSubmitValues) => {
    createPorter.mutate(
      { fullName: values.fullName, phone: values.phone, avatarFile: values.avatarFile },
      {
        onSuccess: () => {
          toast.success('Đã tạo hồ sơ porter mới.');
          navigate(listPath);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Không thể tạo hồ sơ porter.'),
      }
    );
  };

  return (
    <PorterForm
      mode="create"
      listPath={listPath}
      isSubmitting={createPorter.isPending}
      onCancel={() => navigate(listPath)}
      onSubmit={handleSubmit}
    />
  );
}
