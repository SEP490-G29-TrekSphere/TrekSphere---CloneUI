import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
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
import { profileService } from '../services/profileService';

const MOCK_PROFILE: UserProfile = {
  id: 'user-001',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  phone: '0912345678',
  avatar: '',
  username: '@vanna_trek',
  gender: 'male',
  dateOfBirth: '1998-05-15',
  address: 'Hà Nội, Việt Nam',
  bio: 'Đam mê trekking, leo núi và khám phá những cung đường mới lạ tại Việt Nam. Đang hướng tới mục tiêu chinh phục trọn vẹn các đỉnh núi cao trên 3000m tại Tây Bắc.',
  interests: ['Trekking', 'Leo núi', 'Cắm trại'],
  stats: { toursCount: 5, postsCount: 12, followersCount: 1200 },
  joinedAt: '2025-09-01T00:00:00Z',
  role: 'trekker',
};

/**
 * Màn hình 2: Chỉnh sửa hồ sơ.
 * - Cột trái (30%): Sidebar y hệt màn View nhưng mode="edit" (có nút "Thay đổi ảnh").
 * - Cột phải (70%): Form chỉnh sửa với input có nền xám ngà, focus viền xanh rêu.
 * - Cụm nút "Hủy" + "Lưu thay đổi" ở góc dưới bên phải form.
 */
export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);

  // Avatar preview khi user chọn file mới (chưa upload lên server)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load profile hiện tại
  const { data: response, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileService.getProfile(),
    placeholderData: { data: MOCK_PROFILE, status: 200 },
  });
  const profile = response?.data ?? MOCK_PROFILE;

  // Form
  const methods = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? '',
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth ?? '',
      address: profile.address ?? '',
      bio: profile.bio ?? '',
      interests: profile.interests?.map((v: string) => ({ value: v })) ?? [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  // Field array cho interests (tag có thể thêm/xoá)
  const { fields, append, remove } = useFieldArray<UpdateProfileFormValues, 'interests', 'value'>({
    control,
    name: 'interests',
  });

  // Reset form khi load xong data
  useEffect(() => {
    reset({
      name: profile.name,
      phone: profile.phone ?? '',
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth ?? '',
      address: profile.address ?? '',
      bio: profile.bio ?? '',
      interests: profile.interests?.map((v: string) => ({ value: v })) ?? [],
    });
  }, [profile, reset]);

  // Mutation lưu thay đổi
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) =>
      profileService.updateProfile({
        ...data,
        interests: data.interests?.map((i) => i.value),
      }),
    onSuccess: (res) => {
      if (res.error || (res.status && res.status >= 400)) {
        toast.error(res.error || 'Cập nhật thất bại. Vui lòng thử lại.');
        return;
      }
      toast.success('Cập nhật hồ sơ thành công!');

      // Đồng bộ user trong store (chỉ phần name — store hiện chỉ lưu id+name)
      if (res.data) {
        setUser({ id: res.data.id, name: res.data.name });
      }
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      navigate(PATHS.PROFILE);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    },
  });

  const onSubmit = (data: UpdateProfileFormValues) => {
    // Nếu BE chưa sẵn sàng, vẫn cho submit để dev test flow UI
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate(PATHS.PROFILE);
  };

  // Xử lý upload avatar (chỉ preview local, BE sẽ làm phần upload thật)
  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setAvatarPreview(result);
        toast.info('Tính năng upload avatar sẽ kết nối BE sau.');
      }
    };
    reader.readAsDataURL(file);
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
    ...profile,
    avatar: avatarPreview || profile.avatar,
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
                      value={profile.email}
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

                  {/* Địa chỉ */}
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Địa chỉ
                    </label>
                    <input
                      id="address"
                      type="text"
                      autoComplete="street-address"
                      {...register('address')}
                      className="h-11 w-full rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-primary outline-none transition-colors focus:border-primary focus:bg-muted"
                    />
                  </div>
                </div>
              </section>

              {/* Tiểu sử */}
              <section className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold text-primary">Tiểu sử / Giới thiệu</h2>
                <textarea
                  rows={4}
                  placeholder="Hãy viết vài dòng giới thiệu về bản thân..."
                  {...register('bio')}
                  className="w-full resize-y rounded-xl border border-transparent bg-muted px-3.5 py-2.5 text-sm text-primary outline-none transition-colors focus:border-primary focus:bg-muted"
                />
                {errors.bio && (
                  <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>
                )}
              </section>

              {/* Sở thích */}
              <section className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold text-primary">Sở thích</h2>
                <div className="flex flex-wrap gap-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.value}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-primary"
                    >
                      <span>{field.value}</span>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Xoá sở thích"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = window.prompt('Nhập sở thích mới:')?.trim();
                    if (next) append({ value: next });
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-transparent px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent/40"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Thêm sở thích
                </button>
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
