import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import { getSafeImageUrl } from '@/utils/sanitize';
import type { PorterStatus } from '../types';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png'];

/** Regex số điện thoại VN — khớp pattern `PorterProfileRequest.phone` của BE. */
const PHONE_REGEX =
  /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;

const porterFormSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ và tên'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(PHONE_REGEX, 'Số điện thoại không hợp lệ'),
});

type PorterFormValues = z.infer<typeof porterFormSchema>;

export interface PorterFormSubmitValues {
  fullName: string;
  phone: string;
  avatarFile?: File;
  status?: PorterStatus;
}

export interface PorterFormDefaultValues {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  status?: PorterStatus;
}

export interface PorterFormProps {
  mode: 'create' | 'edit';
  /** Đường dẫn về danh sách porter — khác nhau giữa Vendor Manager và Vendor Staff. */
  listPath: string;
  defaultValues?: PorterFormDefaultValues;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: PorterFormSubmitValues) => void;
}

/**
 * Form Tạo/Sửa hồ sơ Porter — trang riêng (không phải dialog), dùng chung cho
 * Vendor Manager và Vendor Staff. Chỉ giữ field mà BE (`PorterProfileRequest`/
 * `UpdatePorterProfileRequest`) thực sự hỗ trợ: họ tên, số điện thoại, avatar,
 * và trạng thái (chỉ ở màn Sửa).
 */
export function PorterForm({
  mode,
  listPath,
  defaultValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: PorterFormProps) {
  const isEdit = mode === 'edit';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(defaultValues?.avatarUrl);
  const [avatarError, setAvatarError] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<PorterStatus>(defaultValues?.status ?? 'ACTIVE');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PorterFormValues>({
    resolver: zodResolver(porterFormSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      phone: defaultValues?.phone ?? '',
    },
  });

  // Sinh preview URL từ file mới chọn, dọn lại khi đổi file/unmount để tránh leak.
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Chỉ chấp nhận ảnh định dạng JPG hoặc PNG.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Ảnh vượt quá dung lượng tối đa 5MB.');
      return;
    }
    setAvatarError(undefined);
    setAvatarFile(file);
  };

  const submit = handleSubmit((values) => {
    onSubmit({
      fullName: values.fullName,
      phone: values.phone,
      avatarFile,
      status: isEdit ? status : undefined,
    });
  });

  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <div>
        <p className="text-xs font-medium" style={{ color: '#6F7B75' }}>
          <Link to={listPath} className="hover:underline">
            Porters
          </Link>{' '}
          &gt; {isEdit ? 'Sửa hồ sơ' : 'Tạo hồ sơ mới'}
        </p>
        <h2
          className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: '#06261D' }}
        >
          {isEdit ? 'Sửa hồ sơ Porter' : 'Tạo hồ sơ Porter mới'}
        </h2>
        <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
          Vui lòng điền đầy đủ các thông tin chi tiết để quản lý nhân sự hiệu quả trong hệ thống
          TrekOps.
        </p>
      </div>

      <div className="rounded-[32px] bg-white p-8" style={{ border: '1px solid #E6E2D1' }}>
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full"
              style={
                avatarPreview
                  ? { backgroundColor: '#F0EEE6' }
                  : { border: '2px dashed #C9C3AE', backgroundColor: '#FAF8F1' }
              }
            >
              {getSafeImageUrl(avatarPreview) ? (
                <img
                  src={getSafeImageUrl(avatarPreview)}
                  alt="Avatar porter"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-6 w-6" style={{ color: '#6F7B75' }} />
              )}
            </div>
            <button
              type="button"
              aria-label="Đổi ảnh đại diện"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: '#06261D', border: '2px solid #FFFFFF' }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#06261D' }}>
              Ảnh đại diện
            </p>
            <p className="mt-1 text-sm" style={{ color: '#6F7B75' }}>
              Tải lên ảnh chân dung rõ mặt, định dạng JPG hoặc PNG. Tối đa 5MB.
            </p>
            {avatarError && <p className="mt-1 text-xs text-red-500">{avatarError}</p>}
          </div>
        </div>

        <hr className="my-6" style={{ borderColor: '#E6E2D1' }} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
              style={{ color: '#6F7B75' }}
            >
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              {...register('fullName')}
              className="w-full rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
              style={{ color: '#6F7B75' }}
            >
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="text"
              placeholder="Nhập số điện thoại liên lạc"
              {...register('phone')}
              className="w-full rounded-2xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
              style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {isEdit && (
            <div className="sm:col-span-2">
              <p
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider"
                style={{ color: '#6F7B75' }}
              >
                Trạng thái
              </p>
              <div className="inline-flex rounded-full p-1" style={{ backgroundColor: '#F0EEE6' }}>
                <button
                  type="button"
                  onClick={() => setStatus('ACTIVE')}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                  style={
                    status === 'ACTIVE'
                      ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                      : { color: '#6F7B75' }
                  }
                >
                  Đang hoạt động
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('INACTIVE')}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                  style={
                    status === 'INACTIVE'
                      ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                      : { color: '#6F7B75' }
                  }
                >
                  Ngừng hoạt động
                </button>
              </div>
            </div>
          )}
        </div>

        <hr className="my-6" style={{ borderColor: '#E6E2D1' }} />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-6 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: '#FFFFFF', color: '#06261D', border: '1px solid #C9C3AE' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: '#06261D' }}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
}
