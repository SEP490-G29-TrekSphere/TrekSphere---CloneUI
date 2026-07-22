import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, MapPin, Send, ShieldCheck, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PATHS } from '@/constants/paths';
import { toast } from '@/store/useToastStore';

const createGroupSchema = z.object({
  tourId: z.string().min(1, 'Vui lòng chọn Tour bạn muốn đi'),
  departureDate: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
  neededMembers: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() !== '' ? Number(val) : val),
    z
      .number({ message: 'Số lượng phải là con số' })
      .min(1, 'Cần tuyển ít nhất 1 người')
      .max(20, 'Tối đa 20 người')
  ),
  description: z.string().optional(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

const DEFAULT_TOURS = [
  { id: '1', name: 'Trekking Tà Năng - Phan Dũng (Lâm Đồng - Bình Thuận)' },
  { id: '2', name: 'Chinh phục Đỉnh Fansipan 2N1Đ (Lào Cai)' },
  { id: '3', name: 'Khám phá Vườn Quốc Gia Cát Tiên (Đồng Nai)' },
  { id: '4', name: 'Chinh phục Đỉnh Pù Luông (Thanh Hóa)' },
  { id: '5', name: 'Trekking Lảo Thẩn - Săn Mây Y Tý (Lào Cai)' },
  { id: '6', name: 'Trekking Sống lưng khủng long Tà Xùa (Sơn La)' },
];

export default function CreateCompanionGroupPage() {
  const navigate = useNavigate();

  const form = useForm<
    z.input<typeof createGroupSchema>,
    undefined,
    z.output<typeof createGroupSchema>
  >({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      tourId: '',
      departureDate: '',
      neededMembers: 4,
      description: '',
    },
  });

  const onSubmit = (data: CreateGroupFormValues) => {
    toast.success('Tạo nhóm đồng hành thành công! Bài viết đang chờ duyệt bởi Quản trị viên.');
    console.log('Submitted Companion Group Data:', data);
    navigate(PATHS.GROUPS);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F1] dark:bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Outer Card Container matching design */}
      <div className="bg-[#FAF8F5] dark:bg-card border border-stone-200 dark:border-border rounded-[2.5rem] p-6 sm:p-10 max-w-5xl w-full shadow-2xl relative">
        {/* Main Grid: Left Banner + Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column (Banner & Tips) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Green Scenic Banner */}
            <div className="relative rounded-[2rem] overflow-hidden min-h-[320px] lg:min-h-[420px] flex flex-col justify-end p-6 sm:p-8 text-white group shadow-lg">
              {/* Background Image with Overlay */}
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"
                alt="Chuyến đi trekking"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  Kết nối đam mê,
                  <br />
                  Chia sẻ hành trình.
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
                  Tạo nhóm để tìm kiếm những người bạn đồng hành chung chí hướng cho chuyến đi sắp
                  tới của bạn.
                </p>
              </div>
            </div>

            {/* Note box matching mockup bottom-left */}
            <div className="bg-[#F5F2EA] dark:bg-muted/40 border border-stone-200/70 dark:border-border/60 rounded-[1.5rem] p-5 space-y-3">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase block">
                LƯU Ý CHO BẠN
              </span>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                  Mô tả chi tiết giúp bạn nhanh chóng tìm được người phù hợp nhất.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                  Số lượng người nên cân đối với độ khó của tour trekking.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-foreground tracking-tight">
                  Tạo Nhóm Đồng Hành
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-muted-foreground mt-1">
                  Điền thông tin bên dưới để bắt đầu tìm kiếm đồng đội.
                </p>
              </div>

              {/* Form Inputs */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Field 1: Tour Select */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                    CHỌN TOUR MUỐN ĐI
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <select
                      {...form.register('tourId')}
                      className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-10 text-sm font-medium text-stone-800 dark:text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-[#1f3933] cursor-pointer"
                    >
                      <option value="" disabled>
                        Tìm điểm đến của bạn...
                      </option>
                      {DEFAULT_TOURS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      ▼
                    </div>
                  </div>
                  {form.formState.errors.tourId && (
                    <p className="text-xs text-red-500 mt-1 pl-2">
                      {form.formState.errors.tourId.message}
                    </p>
                  )}
                </div>

                {/* Grid row: Date & Needed Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 2: Date */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                      CHỌN NGÀY KHỞI HÀNH
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        {...form.register('departureDate')}
                        className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-stone-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#1f3933]"
                      />
                    </div>
                    {form.formState.errors.departureDate && (
                      <p className="text-xs text-red-500 mt-1 pl-2">
                        {form.formState.errors.departureDate.message}
                      </p>
                    )}
                  </div>

                  {/* Field 3: Members Count */}
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                      SỐ LƯỢNG NGƯỜI CẦN TUYỂN
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                        <Users className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        {...form.register('neededMembers')}
                        placeholder="Ví dụ: 4"
                        className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-stone-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#1f3933]"
                      />
                    </div>
                    {form.formState.errors.neededMembers && (
                      <p className="text-xs text-red-500 mt-1 pl-2">
                        {form.formState.errors.neededMembers.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 4: Description */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-stone-500 dark:text-muted-foreground uppercase mb-2">
                    MÔ TẢ LỜI MỜI
                  </label>
                  <textarea
                    rows={4}
                    {...form.register('description')}
                    placeholder="Chia sẻ thêm về bản thân, yêu cầu về thể lực hoặc kinh nghiệm của thành viên bạn muốn tìm..."
                    className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl p-4 text-sm font-medium text-stone-800 dark:text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1f3933] resize-none"
                  />
                </div>

                {/* Submit Action Pill Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#0a231c] hover:bg-[#071914] text-white rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Đăng bài</span>
                  </button>
                  <p className="text-center text-[11px] text-stone-500 dark:text-muted-foreground mt-3">
                    Bài viết sẽ được duyệt bởi quản trị viên trước khi hiển thị công khai.
                  </p>
                </div>
              </form>
            </div>

            {/* Back Button */}
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:text-muted-foreground dark:hover:text-foreground font-semibold underline cursor-pointer"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
