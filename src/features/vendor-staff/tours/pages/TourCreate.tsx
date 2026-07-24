import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { TourForm } from '@/features/vendor-tours/components/TourForm';
import { useVendorTourMutations } from '@/features/vendor-tours/hooks/useVendorTourMutations';
import type { CheckpointSubmitItem, CreateTourPayload } from '@/features/vendor-tours/types';
import { toast } from '@/store/useToastStore';

export default function TourCreate() {
  const navigate = useNavigate();
  const { createTourWithCheckpoints } = useVendorTourMutations();

  const handleCancel = () => navigate(PATHS.PARTNER_TOURS);

  const handleSubmit = (tour: CreateTourPayload, checkpoints: CheckpointSubmitItem[]) => {
    createTourWithCheckpoints.mutate(
      { tour, checkpoints },
      {
        onSuccess: () => {
          toast.success('Đã tạo tour mới (bản nháp).');
          navigate(PATHS.PARTNER_TOURS);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Không thể tạo tour.');
        },
      }
    );
  };

  return (
    <TourForm
      mode="create"
      isSubmitting={createTourWithCheckpoints.isPending}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );
}
