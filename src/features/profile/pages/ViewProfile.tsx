import { useQueryClient } from '@tanstack/react-query';
import { PATHS } from '@/constants';
import { AppButton, AppSpinner } from '@/shared/ui';
import { storage } from '@/utils/storage';
import ProfileSidebar from '../components/ProfileSidebar';
import { useProfile } from '../hooks/useProfile';
import {
  BLOOD_TYPES,
  FITNESS_LEVELS,
  GENDER_LABELS,
  PACE_STYLES,
  SKILL_OPTIONS,
  TERRAIN_OPTIONS,
} from '../types';
import { getAdvancedProfile } from '../utils/advancedProfileStorage';

interface InfoCellProps {
  label: string;
  value?: string;
  subValue?: string;
  highlight?: boolean;
}

function InfoCell({ label, value, subValue, highlight }: InfoCellProps) {
  return (
    <div className={`rounded-xl p-4 transition-all ${highlight ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted'}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-bold text-primary">{value || '—'}</p>
      {subValue && <p className="mt-1 text-xs font-medium text-muted-foreground">{subValue}</p>}
    </div>
  );
}

/**
 * Màn hình 1: Xem hồ sơ cá nhân.
 * Thiết kế theo chuẩn Hallmark Anti-Slop (Typography-first, loại bỏ decorative AI icons, sử dụng high-contrast text badges & structural hierarchy).
 */
export default function ViewProfile({ editPath }: { editPath?: string }) {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const queryClient = useQueryClient();
  const errorMessage = error instanceof Error ? error.message : null;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
        <header className="space-y-1 border-b border-border/60 pb-4">
          <h1 className="text-2xl font-black tracking-tight text-primary md:text-3xl">HỒ SƠ CỦA TÔI</h1>
          <p className="text-sm text-muted-foreground">Xem và quản lý thông tin cá nhân của bạn</p>
        </header>
        <div className="space-y-4 rounded-2xl bg-destructive/10 p-6 text-center border border-destructive/20">
          <p className="text-sm font-semibold text-destructive">
            {errorMessage || 'Không thể tải hồ sơ. Vui lòng đăng nhập hoặc thử lại sau.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <AppButton
              type="button"
              variant="outline"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
                void refetch();
              }}
            >
              Thử lại
            </AppButton>
            {!storage.get<string>('accessToken') && (
              <AppButton type="button" onClick={() => (window.location.href = PATHS.LOGIN)}>
                Đăng nhập lại
              </AppButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayGender = profile?.gender ? GENDER_LABELS[profile.gender] : '—';
  const displayDob = profile?.dateOfBirth || '—';

  // Lấy dữ liệu hồ sơ nâng cao (Y tế khẩn cấp & Ghép nhóm)
  const advProfile = getAdvancedProfile(profile.id);
  const emergency = advProfile.emergencyMedical;
  const prefs = advProfile.preferences;

  const bloodLabel = BLOOD_TYPES.find((b) => b.value === emergency.bloodType)?.label || emergency.bloodType;
  const fitnessObj = FITNESS_LEVELS.find((f) => f.value === prefs.fitnessLevel);
  const paceObj = PACE_STYLES.find((p) => p.value === prefs.paceStyle);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary md:text-3xl">HỒ SƠ CÁ NHÂN</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Thông tin cá nhân, hồ sơ y tế khẩn cấp SOS và tiêu chí đề xuất ghép nhóm
          </p>
        </div>
      </header>

      {/* 2-column layout: sidebar (30%) + main (70%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <ProfileSidebar profile={profile} mode="view" editPath={editPath} />
        </div>

        {/* Main content */}
        <div className="space-y-6 lg:col-span-7">
          {/* Phần 1: Thông tin cá nhân cơ bản */}
          <section className="rounded-2xl bg-card p-6 shadow-sm border border-border/60">
            <div className="mb-5 flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-base font-bold uppercase tracking-wider text-primary">
                Thông tin cá nhân cơ bản
              </h2>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">THÔNG TIN XÁC THỰC</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCell label="Họ và tên" value={profile.name} />
              <InfoCell label="Số điện thoại" value={profile.phone} />
              <InfoCell label="Email" value={profile.email} />
              <InfoCell label="Ngày sinh" value={displayDob} />
              <InfoCell label="Giới tính" value={displayGender} />
            </div>
          </section>

          {/* Phần 2: Thông tin Y tế & SOS Khẩn cấp (Bắt buộc) */}
          <section className="rounded-2xl bg-red-500/5 p-6 shadow-sm border border-red-500/20">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-red-500/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">CẤP CỨU</span>
                  <h2 className="text-base font-bold text-red-950 dark:text-red-300">
                    HỒ SƠ Y TẾ & CỨU HỘ KHẨN CẤP (SOS)
                  </h2>
                </div>
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  * Tự động đồng bộ tới Trưởng nhóm & Hotline Cứu hộ 112/115 khi phát tín hiệu SOS
                </p>
              </div>
              <span className="inline-flex items-center rounded-md bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300 self-start sm:self-auto">
                Dữ liệu Cứu hộ
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoCell
                label="Nhóm máu"
                value={bloodLabel}
                subValue="Cần thiết khi truyền máu cấp cứu"
                highlight
              />
              <InfoCell
                label="Liên hệ Khẩn cấp"
                value={emergency.emergencyContactName}
                subValue={`SĐT: ${emergency.emergencyContactPhone || 'Chưa cập nhật'} (${emergency.emergencyRelationship || 'Người thân'})`}
                highlight
              />
              <div className="rounded-xl bg-card p-4 border border-red-500/10 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tiền sử bệnh lý & Dị ứng thuốc/thực phẩm
                </p>
                <p className="mt-1.5 text-sm font-bold text-primary">
                  {emergency.medicalConditions || 'Không có tiền sử bệnh nghiêm trọng'}
                </p>
                {emergency.allergies && (
                  <div className="mt-2 inline-flex items-center rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                    DỊ ỨNG: {emergency.allergies}
                  </div>
                )}
              </div>
              {(emergency.citizenId || emergency.insuranceId) && (
                <div className="md:col-span-2">
                  <InfoCell
                    label="Số Căn cước công dân (CCCD / Passport)"
                    value={emergency.citizenId || emergency.insuranceId}
                    subValue="Phục vụ thủ tục khai báo biên phòng & mua bảo hiểm du lịch khi tham gia đoàn"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Phần 3: Hồ sơ Ghép nhóm & Kế hoạch Trekking */}
          <section className="rounded-2xl bg-emerald-500/5 p-6 shadow-sm border border-emerald-500/20">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-widest">MATCHING</span>
                  <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-300">
                    HỒ SƠ GHÉP NHÓM & TIÊU CHÍ TREKKING
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sử dụng để hệ thống tự động gợi ý bạn đồng hành và nhóm phù hợp
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Thể lực & Phong cách */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-card p-4 border border-emerald-500/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Trình độ & Thể lực
                  </p>
                  <p className="mt-1.5 text-base font-bold text-emerald-900 dark:text-emerald-300">
                    {fitnessObj?.label || 'Chưa cập nhật'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {prefs.fitnessLevel === 'other' && prefs.fitnessLevelCustom
                      ? prefs.fitnessLevelCustom
                      : fitnessObj?.desc}
                  </p>
                </div>

                <div className="rounded-xl bg-card p-4 border border-emerald-500/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tốc độ di chuyển
                  </p>
                  <p className="mt-1.5 text-base font-bold text-primary">
                    {paceObj?.label || 'Chưa cập nhật'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {prefs.paceStyle === 'other' && prefs.paceStyleCustom
                      ? prefs.paceStyleCustom
                      : paceObj?.desc}
                  </p>
                </div>
              </div>

              {/* Kỹ năng & Trang bị */}
              <div className="rounded-xl bg-card p-4 border border-emerald-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kỹ năng & Trang bị sẵn có
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {prefs.skillsAndEquipment && prefs.skillsAndEquipment.length > 0 ? (
                    prefs.skillsAndEquipment.map((skillId) => {
                      const opt = SKILL_OPTIONS.find((s) => s.id === skillId);
                      const displayLabel =
                        skillId === 'other' && prefs.skillsCustom
                          ? `Khác: ${prefs.skillsCustom}`
                          : opt?.label || skillId;
                      return (
                        <span
                          key={skillId}
                          className="inline-flex items-center rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                        >
                          {displayLabel}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa chọn kỹ năng</span>
                  )}
                </div>
              </div>

              {/* Địa hình ưa thích */}
              <div className="rounded-xl bg-card p-4 border border-emerald-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Địa hình mong muốn trải nghiệm
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {prefs.preferredTerrains && prefs.preferredTerrains.length > 0 ? (
                    prefs.preferredTerrains.map((terrainId) => {
                      const opt = TERRAIN_OPTIONS.find((t) => t.id === terrainId);
                      const displayLabel =
                        terrainId === 'other' && prefs.terrainsCustom
                          ? `Khác: ${prefs.terrainsCustom}`
                          : opt?.label || terrainId;
                      return (
                        <span
                          key={terrainId}
                          className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary"
                        >
                          {displayLabel}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground">Chưa chọn địa hình</span>
                  )}
                </div>
              </div>

              {/* Ghi chú Kế hoạch Trekking */}
              {prefs.planningNotes && (
                <div className="rounded-xl bg-card p-4 border border-emerald-500/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Kế hoạch & Mong muốn ghép nhóm sắp tới
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-primary">
                    "{prefs.planningNotes}"
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
