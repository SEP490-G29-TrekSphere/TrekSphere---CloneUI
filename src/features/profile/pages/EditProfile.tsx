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
import { AppButton, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import ProfileSidebar from '../components/ProfileSidebar';
import { profileKeys, useProfile } from '../hooks/useProfile';
import { profileService } from '../services/profileService';

/**
 * Màn hình 2: Chỉnh sửa hồ sơ.
 * - Cột trái (30%): Sidebar y hệt màn View nhưng mode="edit" (có nút "Thay đổi ảnh").
 * - Cột phải (70%): Form chỉnh sửa với input có nền xám ngà, focus viền xanh rêu.
 * - Cụm nút "Hủy" + "Lưu thay đổi" ở góc dưới bên phải form.
 *
 * Avatar flow đơn giản:
 * 1. User chọn ảnh → preview ngay bằng URL.createObjectURL
 * 2. User bấm "Lưu thay đổi" → tạo FormData với file + các fields khác → gửi 1 lần qua PUT /users/me
 * 3. Nếu user không đổi ảnh → không gửi field avatar
 */
export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  // File object của avatar mới (null = không đổi ảnh)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  // Preview local để hiển thị ngay khi user vừa chọn file
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load profile hiện tại qua hook
  const { data: profile, isLoading } = useProfile();

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
      toast.success('Cập nhật hồ sơ thành công!');

      // Cập nhật user trong store bằng data từ response
      if (res.data) {
        const updatedUser = res.data as UserProfile;
        setUser({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl ?? updatedUser.avatar,
          roles: updatedUser.roles,
        });
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      navigate(PATHS.PROFILE);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    },
  });

  const onSubmit = (data: UpdateProfileFormValues) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate(PATHS.PROFILE);
  };

  // Chọn avatar: preview ngay bằng createObjectURL, lưu file để gửi cùng form
  const handleAvatarChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB.');
      return;
    }
    // Tạo preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setSelectedAvatarFile(file);
  };

  // Render
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
    username: profile?.username,
    gender: profile?.gender,
    dateOfBirth: profile?.dateOfBirth,
    stats: profile?.stats,
    joinedAt: profile?.joinedAt,
    roles: profile?.roles ?? [],
    role: profile?.role ?? '',
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
      {/* Page title */}
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">Chỉnh sửa hồ sơ</h1>
        <p className="text-sm text-muted-foreground">Cập nhật thông tin cá nhân của bạn</p>
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
              <section className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-bold text-primary">Thông tin cá nhân</h2>

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
                    <input
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

              {/* Cụm nút hành động — góc dưới bên phải */}
              <div className="flex items-center justify-end gap-3">
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
