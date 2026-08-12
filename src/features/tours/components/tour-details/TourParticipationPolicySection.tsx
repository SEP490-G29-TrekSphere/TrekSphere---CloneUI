import type { TourParticipationPolicy } from '@/features/tours/types';

interface TourParticipationPolicySectionProps {
  policy: TourParticipationPolicy;
  compact?: boolean;
}

const FITNESS_LABELS: Record<TourParticipationPolicy['fitnessLevel'], string> = {
  ANY: 'Không yêu cầu đặc biệt',
  BASIC: 'Cơ bản',
  MODERATE: 'Trung bình',
  HIGH: 'Tốt',
  EXTREME: 'Rất tốt / chuyên sâu',
};

function rangeLabel(
  minimum: number | null | undefined,
  maximum: number | null | undefined,
  unit: string
): string | null {
  if (minimum != null && maximum != null) return `${minimum}–${maximum} ${unit}`;
  if (minimum != null) return `Từ ${minimum} ${unit}`;
  if (maximum != null) return `Tối đa ${maximum} ${unit}`;
  return null;
}

export function TourParticipationPolicySection({
  policy,
  compact = false,
}: TourParticipationPolicySectionProps) {
  const summaries = [
    { label: 'Độ tuổi', value: rangeLabel(policy.minAge, policy.maxAge, 'tuổi') },
    { label: 'Chiều cao', value: rangeLabel(policy.minHeightCm, policy.maxHeightCm, 'cm') },
    { label: 'Cân nặng', value: rangeLabel(policy.minWeightKg, policy.maxWeightKg, 'kg') },
    { label: 'Thể lực', value: FITNESS_LABELS[policy.fitnessLevel] },
  ].filter((item) => item.value);

  const details = [
    { label: 'Sức khỏe', value: policy.healthRequirements },
    { label: 'Không phù hợp nếu', value: policy.restrictedMedicalConditions },
    { label: 'Kinh nghiệm', value: policy.requiredExperience },
    { label: 'Kỹ năng', value: policy.requiredSkills },
    { label: 'Trang bị', value: policy.requiredEquipment },
    { label: 'Giấy tờ', value: policy.requiredDocuments },
    { label: 'Quy định khác', value: policy.additionalRequirements },
  ].filter((item) => item.value?.trim());

  return (
    <div className={`rounded-2xl border border-[#DED9CA] bg-white ${compact ? 'p-4' : 'p-5'}`}>
      <div>
        <h3 className="text-base font-extrabold text-[#1E3932]">Điều kiện tham gia</h3>
        <p className="mt-0.5 text-xs font-medium text-[#6F7E72]">
          Áp dụng cho tất cả thành viên trong đơn đặt tour.
        </p>
      </div>

      {summaries.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-[#F7F5EF] px-4 py-3 sm:grid-cols-4">
          {summaries.map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-extrabold uppercase tracking-wide text-[#6F7E72]">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-[#1E3932]">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {details.length > 0 && (
        <dl className="mt-3 divide-y divide-[#E8E4DA] border-y border-[#E8E4DA]">
          {details.map((item) => (
            <div key={item.label} className="grid gap-0.5 py-2.5 sm:grid-cols-[145px_1fr] sm:gap-4">
              <dt className="text-xs font-bold text-[#6F7E72]">{item.label}</dt>
              <dd className="whitespace-pre-line text-sm font-medium text-[#1E3932]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
        {policy.guardianRequiredUnderAge != null && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900">
            Dưới {policy.guardianRequiredUnderAge} tuổi cần người giám hộ
          </span>
        )}
        {policy.requiresHealthDeclaration && (
          <span className="rounded-full bg-[#EAF4EE] px-2.5 py-1 text-[#006241]">
            Cần xác nhận sức khỏe
          </span>
        )}
        {policy.requiresMedicalCertificate && (
          <span className="rounded-full bg-[#EAF4EE] px-2.5 py-1 text-[#006241]">
            Cần giấy xác nhận y tế
          </span>
        )}
      </div>
    </div>
  );
}
