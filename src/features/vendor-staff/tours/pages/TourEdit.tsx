import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import {
  type CheckpointDraft,
  parseCheckpointImageUrls,
} from '@/features/vendor-tours/components/CheckpointFields';
import { TourForm } from '@/features/vendor-tours/components/TourForm';
import { useVendorTourCheckpoints } from '@/features/vendor-tours/hooks/useVendorTourCheckpoints';
import { useVendorTourDetail } from '@/features/vendor-tours/hooks/useVendorTourDetail';
import { useVendorTourMutations } from '@/features/vendor-tours/hooks/useVendorTourMutations';
import type {
  ApiDifficulty,
  CheckpointSubmitItem,
  CreateTourPayload,
  VendorTourCheckpoint,
} from '@/features/vendor-tours/types';
import { toast } from '@/store/useToastStore';

type FormDifficulty = 'EASY' | 'MODERATE' | 'HARD';
const FORM_DIFFICULTIES: readonly FormDifficulty[] = ['EASY', 'MODERATE', 'HARD'];

/** Form Tạo/Sửa chỉ hỗ trợ 3 mức độ khó — fallback về EASY nếu BE trả giá trị khác. */
function toFormDifficulty(value: ApiDifficulty): FormDifficulty {
  return (FORM_DIFFICULTIES as readonly string[]).includes(value)
    ? (value as FormDifficulty)
    : 'EASY';
}

/** Checkpoint từ server → draft cho form, giữ lại `checkpointId` để PUT/DELETE đúng chỗ. */
function toCheckpointDraft(checkpoint: VendorTourCheckpoint): CheckpointDraft {
  return {
    key: checkpoint.checkpointId,
    checkpointId: checkpoint.checkpointId,
    name: checkpoint.checkpointName,
    description: checkpoint.description ?? '',
    latitude: checkpoint.latitude?.toString() ?? '',
    longitude: checkpoint.longitude?.toString() ?? '',
    altitude: checkpoint.altitude?.toString() ?? '',
    // BE trả cả `checkpointImageUrls` (mảng) lẫn `checkpointImageUrl` (chuỗi gộp bởi dấu phẩy) —
    // ưu tiên mảng, không có thì tự tách chuỗi.
    imageUrls:
      checkpoint.checkpointImageUrls ?? parseCheckpointImageUrls(checkpoint.checkpointImageUrl),
    imageFiles: [],
  };
}

export default function TourEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tour, isLoading: isTourLoading, isError, error } = useVendorTourDetail(id);
  // Lỗi tải checkpoint không chặn cả màn Sửa — coi như tour chưa có checkpoint nào nếu fail.
  const { data: checkpoints, isLoading: isCheckpointsLoading } = useVendorTourCheckpoints(id);
  const { updateTourWithCheckpoints } = useVendorTourMutations();

  const isLoading = isTourLoading || isCheckpointsLoading;

  const handleCancel = () => navigate(PATHS.PARTNER_TOURS);

  const handleSubmit = (
    payload: CreateTourPayload,
    checkpointItems: CheckpointSubmitItem[],
    deletedCheckpointIds: string[]
  ) => {
    if (!id) return;
    updateTourWithCheckpoints.mutate(
      { tourId: id, tour: payload, checkpoints: checkpointItems, deletedCheckpointIds },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật tour.');
          navigate(PATHS.PARTNER_TOURS);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật tour.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div
        className="space-y-4 rounded-3xl bg-white p-6 text-center"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <p className="text-sm" style={{ color: '#DC2626' }}>
          Không thể tải thông tin tour:{' '}
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D3C4', color: '#06261D' }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <TourForm
      mode="edit"
      defaultValues={{
        tourName: tour.tourName,
        difficulty: toFormDifficulty(tour.difficulty),
        basePrice: tour.basePrice,
        location: tour.location,
        minCapacity: tour.minCapacity ?? 1,
        maxCapacity: tour.maxCapacity,
        durationDays: tour.durationDays,
        description: tour.description,
        minAge: tour.participationPolicy?.minAge?.toString() ?? '18',
        maxAge: tour.participationPolicy?.maxAge?.toString() ?? '',
        fitnessLevel: tour.participationPolicy?.fitnessLevel ?? 'ANY',
        healthRequirements: tour.participationPolicy?.healthRequirements ?? '',
        restrictedMedicalConditions: tour.participationPolicy?.restrictedMedicalConditions ?? '',
        requiredExperience: tour.participationPolicy?.requiredExperience ?? '',
        requiredSkills: tour.participationPolicy?.requiredSkills ?? '',
        requiredEquipment: tour.participationPolicy?.requiredEquipment ?? '',
        requiredDocuments: tour.participationPolicy?.requiredDocuments ?? '',
        requiresHealthDeclaration: tour.participationPolicy?.requiresHealthDeclaration ?? true,
        requiresMedicalCertificate: tour.participationPolicy?.requiresMedicalCertificate ?? false,
        guardianRequiredUnderAge:
          tour.participationPolicy?.guardianRequiredUnderAge?.toString() ?? '',
        additionalRequirements: tour.participationPolicy?.additionalRequirements ?? '',
      }}
      existingCoverImageUrl={tour.coverImageUrl ?? undefined}
      initialCheckpoints={(checkpoints ?? []).map(toCheckpointDraft)}
      isSubmitting={updateTourWithCheckpoints.isPending}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );
}
