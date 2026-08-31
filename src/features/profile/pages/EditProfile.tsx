import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import type { UserProfile } from '@/features/auth';
import {
  type UpdateProfileFormValues,
  updateProfileSchema,
} from '@/features/auth/validations/auth.schema';
import { AppButton, AppInput, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import ProfileSidebar from '../components/ProfileSidebar';
import { normalizeProfile, profileKeys, useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profileService';
import {
  BLOOD_TYPES,
  type EmergencyMedicalInfo,
  FITNESS_LEVELS,
  PACE_STYLES,
  SKILL_OPTIONS,
  TERRAIN_OPTIONS,
  type TrekkingPreferences,
} from '../types';
import {
  DEFAULT_ADVANCED_PROFILE,
  getAdvancedProfile,
  saveAdvancedProfile,
} from '../utils/advancedProfileStorage';

/**
 * Màn hình 2: Chỉnh sửa hồ sơ.
 * - Cột trái (30%): Sidebar y hệt màn View nhưng mode="edit" (có nút "Thay đổi ảnh").
 * - Cột phải (70%): Form chỉnh sửa cơ bản + Hồ sơ Y tế khẩn cấp SOS + Hồ sơ Ghép nhóm Trekking.
 */
export default function EditProfile({ returnPath }: { returnPath?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  // File object của avatar mới (null = không đổi ảnh)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  // Preview local để hiển thị ngay khi user vừa chọn file
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load profile hiện tại qua hook
  const { data: profile, isLoading } = useProfile();

  // State cho thông tin y tế khẩn cấp & ghép nhóm
  const [emergencyMedical, setEmergencyMedical] = useState<EmergencyMedicalInfo>(
    DEFAULT_ADVANCED_PROFILE.emergencyMedical
  );
  const [preferences, setPreferences] = useState<TrekkingPreferences>(
    DEFAULT_ADVANCED_PROFILE.preferences
  );

  // Form — dùng empty object fallback để tránh crash khi profile đang null
  const methods = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      phone: profile?.phone ?? '',
      gender: profile?.gender,
      dateOfBirth: profile?.dateOfBirth ?? '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  // Reset form khi load xong data
  useEffect(() => {
    if (!profile) return;
    reset({
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth ?? '',
    });
    const adv = getAdvancedProfile(profile.id);
    setEmergencyMedical(adv.emergencyMedical);
    setPreferences(adv.preferences);
  }, [profile, reset]);

  // Mutation lưu thay đổi - gửi multipart/form-data
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) => {
      // Tạo FormData theo yêu cầu API PUT /users/me (multipart/form-data)
      const formData = new FormData();
      formData.append('fullName', data.name);
      if (data.phone) formData.append('phone', data.phone);
      if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);
      if (data.gender) formData.append('gender', data.gender.toUpperCase());

      // Chỉ append avatar khi user đổi ảnh
      if (selectedAvatarFile) {
        formData.append('avatar', selectedAvatarFile);
      }

      return profileService.updateProfile(formData);
    },
    onSuccess: (res) => {
      if (res.error || (res.status && res.status >= 400)) {
        toast.error(res.message || res.error || 'Cập nhật thất bại. Vui lòng thử lại.');
        return;
      }

      // Lưu thông tin nâng cao (Y tế khẩn cấp & Ghép nhóm) vào local storage theo userId
      if (profile?.id) {
        saveAdvancedProfile(profile.id, {
          emergencyMedical,
          preferences,
        });
      }

      toast.success('Cập nhật hồ sơ & thông tin khẩn cấp thành công!');

      if (res.data) {
        const updatedUser = normalizeProfile(res.data as unknown as Record<string, unknown>);
        const currentUser = useAppStore.getState().user;
        setUser({
          id: updatedUser.id || (currentUser?.id ?? ''),
          name: updatedUser.name || (currentUser?.name ?? ''),
          email: updatedUser.email || currentUser?.email,
          avatarUrl: updatedUser.avatar ?? currentUser?.avatarUrl,
          roles: updatedUser.roles.length > 0 ? updatedUser.roles : currentUser?.roles,
        });
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      navigate(returnPath ?? PATHS.PROFILE);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    },
  });

  const onSubmit = (data: UpdateProfileFormValues) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate(returnPath ?? PATHS.PROFILE);
  };

  const handleAvatarChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedAvatarFile(file);
  };

  // Helper toggle skill checkbox
  const toggleSkill = (skillId: string) => {
    setPreferences((prev) => {
      const current = prev.skillsAndEquipment || [];
      const updated = current.includes(skillId)
        ? current.filter((s) => s !== skillId)
        : [...current, skillId];
      return { ...prev, skillsAndEquipment: updated };
    });
  };

  // Helper toggle terrain checkbox
  const toggleTerrain = (terrainId: string) => {
    setPreferences((prev) => {
      const current = prev.preferredTerrains || [];
      const updated = current.includes(terrainId)
        ? current.filter((t) => t !== terrainId)
        : [...current, terrainId];
      return { ...prev, preferredTerrains: updated };
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  const previewProfile: UserProfile = {
    id: profile?.id ?? '',
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone,
    avatar: avatarPreview || profile?.avatar,
    gender: profile?.gender,
    dateOfBirth: profile?.dateOfBirth,
    roles: profile?.roles ?? [],
    role: profile?.role ?? '',
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      {/* Page title */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">Chỉnh sửa hồ sơ</h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật thông tin cá nhân, hồ sơ y tế khẩn cấp SOS và tiêu chí đề xuất ghép nhóm
        </p>
      </header>

      {/* 2-column layout: sidebar (30%) + form (70%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <ProfileSidebar
            profile={previewProfile}
            mode="edit"
            onAvatarChange={handleAvatarChange}
          />
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Phần 1: Thông tin cá nhân cơ bản */}
              <section className="rounded-2xl bg-card p-6 shadow-sm border border-border/50">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-primary">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                    [CƠ BẢN]
                  </span>
                  Thông tin cá nhân cơ bản
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Họ và tên */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register('name')}
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-primary focus:bg-muted"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Số điện thoại
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      {...register('phone')}
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-primary focus:bg-muted"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email — readonly */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                      disabled
                      className="h-11 w-full cursor-not-allowed rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-muted-foreground outline-none"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Email không thể thay đổi</p>
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Ngày sinh
                    </label>
                    <AppInput
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-primary focus:bg-muted"
                    />
                  </div>

                  {/* Giới tính */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Giới tính
                    </label>
                    <select
                      id="gender"
                      {...register('gender')}
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-primary focus:bg-muted"
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Phần 2: Thông tin Y tế & SOS Khẩn cấp (Bắt buộc cho SOS khẩn cấp) */}
              <section className="rounded-2xl bg-red-500/5 p-6 shadow-sm border border-red-500/20">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-600 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded">
                      [CẤP CỨU]
                    </span>
                    <h2 className="text-lg font-bold text-red-950 dark:text-red-300">
                      Thông tin Y tế & Cứu hộ Khẩn cấp (Dùng cho SOS)
                    </h2>
                  </div>
                  <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600 uppercase tracking-wide">
                    Bắt buộc khi Trekking
                  </span>
                </div>
                <p className="mb-5 text-xs text-muted-foreground">
                  Thông tin này cực kỳ quan trọng đối với Trưởng nhóm và Tổng đài cứu hộ trong các
                  trường hợp sự cố khẩn cấp trên cung đường trekking.
                </p>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Nhóm máu */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Nhóm máu cá nhân <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={emergencyMedical.bloodType}
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          bloodType: e.target.value as EmergencyMedicalInfo['bloodType'],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    >
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt.value} value={bt.value}>
                          {bt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Số CCCD / CMND */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Số Căn cước công dân (CCCD / Passport){' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyMedical.citizenId || emergencyMedical.insuranceId || ''}
                      placeholder="VD: 001098012345"
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          citizenId: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Dùng mua bảo hiểm du lịch chuyến đi & khai báo thủ tục biên phòng/kiểm lâm.
                    </p>
                  </div>

                  {/* Họ tên người liên hệ khẩn cấp */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Họ & Tên Người thân liên hệ khẩn cấp{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyMedical.emergencyContactName}
                      placeholder="VD: Nguyễn Văn A (Bố ruột)"
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          emergencyContactName: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    />
                  </div>

                  {/* SĐT người liên hệ khẩn cấp */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      SĐT Khẩn cấp người thân <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      value={emergencyMedical.emergencyContactPhone}
                      placeholder="VD: 0988 123 456"
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          emergencyContactPhone: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    />
                  </div>

                  {/* Mối quan hệ */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Mối quan hệ với người liên hệ khẩn cấp
                    </label>
                    <input
                      type="text"
                      value={emergencyMedical.emergencyRelationship}
                      placeholder="VD: Bố / Mẹ, Vợ / Chồng, Anh / Chị, Bạn thân..."
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          emergencyRelationship: e.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    />
                  </div>

                  {/* Tiền sử bệnh lý */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tiền sử bệnh lý / Sức khỏe cần lưu ý
                    </label>
                    <textarea
                      rows={2}
                      value={emergencyMedical.medicalConditions}
                      placeholder="Ghi rõ tiền sử hen suyễn, tim mạch, huyết áp, chấn thương khớp..."
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          medicalConditions: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-transparent bg-muted p-3 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    />
                  </div>

                  {/* Tiền sử dị ứng */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Dị ứng thực phẩm / Thuốc kháng sinh
                    </label>
                    <textarea
                      rows={2}
                      value={emergencyMedical.allergies}
                      placeholder="Dị ứng hải sản, dị ứng Penicillin, côn trùng cắn..."
                      onChange={(e) =>
                        setEmergencyMedical((prev) => ({
                          ...prev,
                          allergies: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-transparent bg-muted p-3 text-sm font-semibold text-primary outline-none transition-colors focus:border-red-500 focus:bg-muted"
                    />
                  </div>
                </div>
              </section>

              {/* Phần 3: Hồ sơ Ghép nhóm & Kế hoạch Trekking (Đề xuất ghép nhóm) */}
              <section className="rounded-2xl bg-emerald-500/5 p-6 shadow-sm border border-emerald-500/20">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                      [MATCHING]
                    </span>
                    <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-300">
                      Hồ sơ Ghép nhóm & Kế hoạch Trekking
                    </h2>
                  </div>
                </div>
                <p className="mb-5 text-xs text-muted-foreground">
                  Hệ thống dùng tiêu chuẩn này để tính % độ tương thích và gợi ý các nhóm bạn đồng
                  hành có cùng thể lực & gu trekking.
                </p>

                <div className="space-y-5">
                  {/* Trình độ thể lực */}
                  {/* Trình độ thể lực */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cấp độ Thể lực & Kinh nghiệm Trekking
                    </label>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {FITNESS_LEVELS.map((fit) => {
                        const isSelected = preferences.fitnessLevel === fit.value;
                        return (
                          <button
                            key={fit.value}
                            type="button"
                            onClick={() =>
                              setPreferences((prev) => ({
                                ...prev,
                                fitnessLevel: fit.value as TrekkingPreferences['fitnessLevel'],
                              }))
                            }
                            className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-sm'
                                : 'bg-card border-border/60 hover:border-emerald-500/40 text-primary'
                            }`}
                          >
                            <span className="text-sm font-bold">{fit.label}</span>
                            <span className="mt-1 text-xs text-muted-foreground">{fit.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    {preferences.fitnessLevel === 'other' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={preferences.fitnessLevelCustom || ''}
                          placeholder="Mô tả cụ thể về tình trạng thể lực hoặc yêu cầu hỗ trợ của bạn..."
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              fitnessLevelCustom: e.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-xl border border-emerald-500/50 bg-background px-3.5 text-xs font-semibold text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tốc độ trekking */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Phong cách / Tốc độ di chuyển
                    </label>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {PACE_STYLES.map((pace) => {
                        const isSelected = preferences.paceStyle === pace.value;
                        return (
                          <button
                            key={pace.value}
                            type="button"
                            onClick={() =>
                              setPreferences((prev) => ({
                                ...prev,
                                paceStyle: pace.value as TrekkingPreferences['paceStyle'],
                              }))
                            }
                            className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-sm'
                                : 'bg-card border-border/60 hover:border-emerald-500/40 text-primary'
                            }`}
                          >
                            <span className="text-xs font-bold">{pace.label}</span>
                            <span className="mt-1 text-[11px] text-muted-foreground">
                              {pace.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {preferences.paceStyle === 'other' && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={preferences.paceStyleCustom || ''}
                          placeholder="Nhập tốc độ / phong cách di chuyển tùy chỉnh của bạn..."
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              paceStyleCustom: e.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-xl border border-emerald-500/50 bg-background px-3.5 text-xs font-semibold text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Kỹ năng & Trang bị */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Kỹ năng & Trang bị sẵn có của bạn
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SKILL_OPTIONS.map((opt) => {
                        const checked = (preferences.skillsAndEquipment || []).includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                              checked
                                ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-900 dark:text-emerald-300'
                                : 'bg-card border-border/50 text-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSkill(opt.id)}
                              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                    {(preferences.skillsAndEquipment || []).includes('other') && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={preferences.skillsCustom || ''}
                          placeholder="Mô tả kỹ năng hoặc trang bị khác (VD: Bộ đàm dã ngoại, Flycam quay chụp, thuyền SUP...)"
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              skillsCustom: e.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-xl border border-emerald-500/50 bg-background px-3.5 text-xs font-semibold text-primary outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Địa hình ưa thích */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Địa hình Trekking muốn chinh phục
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {TERRAIN_OPTIONS.map((opt) => {
                        const checked = (preferences.preferredTerrains || []).includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                              checked
                                ? 'bg-primary/10 border-primary/60 text-primary'
                                : 'bg-card border-border/50 text-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTerrain(opt.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                    {(preferences.preferredTerrains || []).includes('other') && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={preferences.terrainsCustom || ''}
                          placeholder="Mô tả loại địa hình khác bạn muốn trải nghiệm (VD: Đồi cỏ Tà Năng, Thảm rêu Tây Bắc...)"
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              terrainsCustom: e.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-xl border border-primary/50 bg-background px-3.5 text-xs font-semibold text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ghi chú Kế hoạch */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Kế hoạch & Mong muốn ghép nhóm cụ thể
                    </label>
                    <textarea
                      rows={3}
                      value={preferences.planningNotes || ''}
                      placeholder="Ví dụ: Đang lên kế hoạch đi Tà Xùa dịp cuối tuần này, cần tìm nhóm 3-4 người có lều trại cùng chia sẻ chi phí xe..."
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          planningNotes: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-transparent bg-muted p-3 text-sm font-semibold text-primary outline-none transition-colors focus:border-emerald-500 focus:bg-muted"
                    />
                  </div>
                </div>
              </section>

              {/* Cụm nút hành động — góc dưới bên phải */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="rounded-xl border-2 border-primary bg-transparent px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
                >
                  Hủy
                </button>
                <AppButton
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="rounded-xl px-6 py-2.5"
                >
                  {isSubmitting || updateMutation.isPending ? (
                    <>
                      <AppSpinner size="sm" className="text-primary-foreground" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </AppButton>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
