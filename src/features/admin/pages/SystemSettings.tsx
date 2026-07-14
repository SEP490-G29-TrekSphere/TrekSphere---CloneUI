import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Mail, Save, ShieldAlert, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { systemSettingsService } from '@/features/admin/services/systemSettingsService';
import {
  type SystemSettingsFormValues,
  systemSettingsSchema,
} from '@/features/admin/validations/systemSettingsSchema';
import { AppButton, AppCard } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      maxRainfall: 0,
      maxWindSpeed: 0,
      minTemperature: 0,
      emailNotifications: false,
      pushNotifications: false,
      backupInterval: '',
      require2fa: false,
    },
  });
  // Fetch initial settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await systemSettingsService.getSettings();
        if (response.data) {
          reset(response.data);
        }
      } catch (_error) {
        toast.error('Không thể tải cấu hình hệ thống');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SystemSettingsFormValues) => {
    setSaving(true);
    try {
      const response = await systemSettingsService.updateSettings(data);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(response.message || 'Lưu cấu hình hệ thống thành công');
        // Reset dirty state to new values
        reset(data);
      }
    } catch (_error) {
      toast.error('Lưu cấu hình thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    toast.info('Đã hủy các thay đổi chưa lưu');
  };

  // Triggers E1 exception if form validation fails
  const onInvalid = () => {
    toast.error('Threshold values out of acceptable range');
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B3025] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0B3025] leading-none mb-2">
            Cấu hình Hệ thống
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Quản lý các tham số vận hành, ngưỡng an toàn và kênh thông báo của nền tảng.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Weather Alert Configuration Card */}
        <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 md:p-8">
          <div className="flex gap-4 items-start pb-6 border-b border-[#F4F4F2] mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-800 tracking-tight mb-1">
                Cấu hình cảnh báo thời tiết
              </h3>
              <p className="text-zinc-500 text-xs font-semibold">
                Thiết lập các ngưỡng an toàn để hệ thống tự động gửi cảnh báo cho các tour đang diễn
                ra.
              </p>
            </div>
          </div>

          {/* Form input fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Max Rainfall */}
            <div className="flex flex-col">
              <label
                htmlFor="maxRainfall"
                className="text-zinc-500 font-bold text-xs mb-2 tracking-wide uppercase"
              >
                Lượng mưa tối đa (mm)
              </label>
              <Controller
                name="maxRainfall"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#0B3025] transition-all">
                    <input
                      id="maxRainfall"
                      type="number"
                      className="bg-transparent border-none outline-none w-full text-zinc-800 font-bold text-base placeholder-zinc-300"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <span className="text-zinc-400 font-semibold text-sm select-none ml-2">mm</span>
                  </div>
                )}
              />
            </div>

            {/* Max Wind Speed */}
            <div className="flex flex-col">
              <label
                htmlFor="maxWindSpeed"
                className="text-zinc-500 font-bold text-xs mb-2 tracking-wide uppercase"
              >
                Tốc độ gió tối đa (km/h)
              </label>
              <Controller
                name="maxWindSpeed"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#0B3025] transition-all">
                    <input
                      id="maxWindSpeed"
                      type="number"
                      className="bg-transparent border-none outline-none w-full text-zinc-800 font-bold text-base placeholder-zinc-300"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <span className="text-zinc-400 font-semibold text-sm select-none ml-2">
                      km/h
                    </span>
                  </div>
                )}
              />
            </div>

            {/* Min Temperature */}
            <div className="flex flex-col">
              <label
                htmlFor="minTemperature"
                className="text-zinc-500 font-bold text-xs mb-2 tracking-wide uppercase"
              >
                Nhiệt độ thấp nhất (°C)
              </label>
              <Controller
                name="minTemperature"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#0B3025] transition-all">
                    <input
                      id="minTemperature"
                      type="number"
                      className="bg-transparent border-none outline-none w-full text-zinc-800 font-bold text-base placeholder-zinc-300"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? 0 : Number(e.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <span className="text-zinc-400 font-semibold text-sm select-none ml-2">°C</span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Validation error display */}
          {(errors.maxRainfall || errors.maxWindSpeed || errors.minTemperature) && (
            <div className="space-y-1 mt-3">
              {errors.maxRainfall && (
                <p className="text-xs text-red-500 font-semibold">{errors.maxRainfall.message}</p>
              )}
              {errors.maxWindSpeed && (
                <p className="text-xs text-red-500 font-semibold">{errors.maxWindSpeed.message}</p>
              )}
              {errors.minTemperature && (
                <p className="text-xs text-red-500 font-semibold">
                  {errors.minTemperature.message}
                </p>
              )}
            </div>
          )}
        </AppCard>

        {/* Notifications Settings Card */}
        <AppCard className="border-[#E5E4DE] shadow-sm rounded-3xl bg-white p-6 md:p-8">
          <div className="flex gap-4 items-start pb-6 border-b border-[#F4F4F2] mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F1EE] text-[#0B3025]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-800 tracking-tight mb-1">
                Cài đặt thông báo
              </h3>
              <p className="text-zinc-500 text-xs font-semibold">
                Quản lý cách thức hệ thống liên lạc với quản trị viên và điều hành tour.
              </p>
            </div>
          </div>

          {/* Toggles list */}
          <div className="space-y-4">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-2xl border border-[#E5E4DE]">
              <div className="flex gap-4 items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E4DE] text-zinc-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-800">Thông báo qua Email</h4>
                  <p className="text-zinc-500 text-[11px] font-semibold mt-0.5">
                    Gửi báo cáo tổng hợp và cảnh báo quan trọng về email admin.
                  </p>
                </div>
              </div>
              <Controller
                name="emailNotifications"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    aria-label="Thông báo qua Email"
                    aria-pressed={value}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3025] focus-visible:ring-offset-2 ${
                      value ? 'bg-[#0B3025]' : 'bg-zinc-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        value ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-2xl border border-[#E5E4DE]">
              <div className="flex gap-4 items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E4DE] text-zinc-500">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-800">Thông báo ứng dụng (Push)</h4>
                  <p className="text-zinc-500 text-[11px] font-semibold mt-0.5">
                    Gửi thông báo trực tiếp đến ứng dụng di động của HDV.
                  </p>
                </div>
              </div>
              <Controller
                name="pushNotifications"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <button
                    type="button"
                    onClick={() => onChange(!value)}
                    aria-label="Thông báo ứng dụng (Push)"
                    aria-pressed={value}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3025] focus-visible:ring-offset-2 ${
                      value ? 'bg-[#0B3025]' : 'bg-zinc-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        value ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
              />
            </div>
          </div>
        </AppCard>

        {/* Data Backup and Security Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Info */}
          <div className="flex items-center justify-between p-6 bg-[#FAF9F5] rounded-3xl border border-[#E5E4DE]">
            <div>
              <span className="text-[9px] font-extrabold text-zinc-400 tracking-wider block mb-1 uppercase">
                LƯU TRỮ DỮ LIỆU
              </span>
              <h4 className="font-extrabold text-sm text-zinc-800">Tự động sao lưu</h4>
            </div>
            <Controller
              name="backupInterval"
              control={control}
              render={({ field }) => (
                <select
                  id="backupInterval"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className="bg-[#E8F1EE] text-[#0B3025] border-transparent font-bold px-3 py-1.5 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#0B3025] cursor-pointer"
                >
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              )}
            />
          </div>

          {/* 2FA Info */}
          <div className="flex items-center justify-between p-6 bg-[#FAF9F5] rounded-3xl border border-[#E5E4DE]">
            <div>
              <span className="text-[9px] font-extrabold text-zinc-400 tracking-wider block mb-1 uppercase">
                BẢO MẬT HỆ THỐNG
              </span>
              <h4 className="font-extrabold text-sm text-zinc-800">Xác thực 2 lớp (2FA)</h4>
            </div>
            <Controller
              name="require2fa"
              control={control}
              render={({ field }) => (
                <select
                  id="require2fa"
                  value={field.value ? 'true' : 'false'}
                  onChange={(e) => field.onChange(e.target.value === 'true')}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  className={`${
                    field.value ? 'bg-amber-50 text-amber-800' : 'bg-zinc-100 text-zinc-500'
                  } border-transparent font-bold px-3 py-1.5 rounded-full text-xs outline-none focus:ring-2 focus:ring-[#0B3025] cursor-pointer`}
                >
                  <option value="true">Bắt buộc</option>
                  <option value="false">Tắt</option>
                </select>
              )}
            />
          </div>
        </div>

        {/* Action Buttons bar */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#E5E4DE] mt-8">
          <AppButton
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={!isDirty || saving}
            className="text-zinc-500 hover:text-zinc-800 font-bold transition-all"
          >
            Hủy thay đổi
          </AppButton>
          <AppButton
            type="submit"
            disabled={saving}
            className="bg-[#0B3025] hover:bg-[#06241C] text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu cấu hình
          </AppButton>
        </div>
      </form>
    </div>
  );
}
