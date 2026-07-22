import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PATHS } from '@/constants/paths';
import { toast } from '@/store/useToastStore';

const joinRequestSchema = z.object({
  message: z.string().min(1, 'Vui lòng nhập lời nhắn gửi đến trưởng nhóm'),
  agreeHealth: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần cam kết đủ sức khỏe và kinh nghiệm trekking',
  }),
  agreeRules: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần đồng ý tuân thủ các quy tắc an toàn',
  }),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần đồng ý với Chính sách bảo mật và Điều khoản',
  }),
});

type JoinRequestFormValues = z.infer<typeof joinRequestSchema>;

const MOCK_TOUR_CARD_INFO = {
  id: 'fansipan-3n2d',
  title: 'Chinh phục Đỉnh Fansipan 3N2Đ',
  badge: 'Sắp khởi hành',
  departureDate: '25/11/2024',
  leaderName: 'Hoàng Minh',
  currentMembers: 7,
  maxMembers: 12,
  thumbnailUrl:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
  currentMemberList: [
    {
      id: '1',
      name: 'Hoàng...',
      isLeader: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: '2',
      name: 'Thu Thủy',
      avatarUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: '3',
      name: 'Văn Nam',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: '4',
      name: 'Lan Anh',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: '5',
      name: 'Quốc Huy',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  ],
  extraMemberCount: 2,
};

export default function JoinGroupRequestPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const form = useForm<JoinRequestFormValues>({
    resolver: zodResolver(joinRequestSchema),
    defaultValues: {
      message: '',
      agreeHealth: false,
      agreeRules: false,
      agreeTerms: false,
    },
  });

  const onSubmit = (data: JoinRequestFormValues) => {
    toast.success('Đã gửi yêu cầu tham gia thành công! Trưởng nhóm sẽ xét duyệt yêu cầu của bạn.');
    console.log('Join Request Submitted:', { groupId, ...data });
    navigate(PATHS.GROUPS);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EB] dark:bg-background pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Container Khung Trắng Viền Bo Tròn (Giống hình thiết kế) */}
      <div className="bg-[#FAF8F5] dark:bg-card border border-stone-200/80 dark:border-border rounded-[2.5rem] p-6 sm:p-10 max-w-5xl w-full shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: Thông tin Tour & Danh sách thành viên hiện tại */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card Tour */}
            <div className="bg-[#F0EBE1] dark:bg-muted/40 rounded-[2rem] p-4 border border-stone-200/60 dark:border-border/50 shadow-xs space-y-4">
              {/* Ảnh Thumbnail + Badge */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem]">
                <img
                  src={MOCK_TOUR_CARD_INFO.thumbnailUrl}
                  alt={MOCK_TOUR_CARD_INFO.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#A3E6BA] text-[#0D3B2E] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {MOCK_TOUR_CARD_INFO.badge}
                </span>
              </div>

              {/* Chi tiết Tour */}
              <div className="px-1 space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-foreground leading-snug">
                  {MOCK_TOUR_CARD_INFO.title}
                </h2>

                <div className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-muted-foreground">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span>Khởi hành: {MOCK_TOUR_CARD_INFO.departureDate}</span>
                </div>

                <div className="pt-2 border-t border-stone-300/40 dark:border-border/40 flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                    <span>
                      Trưởng nhóm:{' '}
                      <strong className="font-semibold">{MOCK_TOUR_CARD_INFO.leaderName}</strong>
                    </span>
                  </div>
                  <span className="bg-[#E4DCD0] dark:bg-muted text-stone-800 dark:text-stone-200 font-bold px-3 py-1 rounded-full text-xs">
                    {MOCK_TOUR_CARD_INFO.currentMembers}/{MOCK_TOUR_CARD_INFO.maxMembers} Thành viên
                  </span>
                </div>
              </div>
            </div>

            {/* Block Thành viên hiện tại */}
            <div className="bg-white dark:bg-card rounded-[2rem] p-5 border border-stone-200/60 dark:border-border/50 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-muted-foreground">
                THÀNH VIÊN HIỆN TẠI
              </h3>

              <div className="grid grid-cols-5 gap-2 text-center">
                {MOCK_TOUR_CARD_INFO.currentMemberList.map((member) => (
                  <div key={member.id} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-card shadow-xs"
                      />
                      {member.isLeader && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-white text-[9px] font-bold">
                          ★
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate w-full">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hiển thị số lượng thêm (+2 Khác) */}
              {MOCK_TOUR_CARD_INFO.extraMemberCount > 0 && (
                <div className="flex justify-start">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full bg-stone-200 dark:bg-muted text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-xs shadow-xs">
                      +{MOCK_TOUR_CARD_INFO.extraMemberCount}
                    </div>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-muted-foreground">
                      Khác
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: Form Gửi yêu cầu tham gia */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-foreground tracking-tight">
                Gửi yêu cầu tham gia
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-muted-foreground mt-1 leading-relaxed">
                Vui lòng giới thiệu bản thân và chấp nhận các điều khoản để trưởng nhóm xét duyệt.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Field 1: Lời nhắn gửi đến trưởng nhóm */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                  Lời nhắn gửi đến trưởng nhóm <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  {...form.register('message')}
                  placeholder="Chào trưởng nhóm, mình rất muốn tham gia tour này vì..."
                  className="w-full bg-[#F3F0E6] dark:bg-muted/60 border-none rounded-2xl p-4 text-xs sm:text-sm text-stone-900 dark:text-foreground placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0D3B2E] resize-none"
                />
                {form.formState.errors.message && (
                  <p className="text-xs text-red-500 mt-1 pl-2 font-medium">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>

              {/* Fieldset: Điều khoản cam kết */}
              <div className="bg-[#F3EFEE] dark:bg-muted/40 rounded-[2rem] p-5 border border-stone-200/60 dark:border-border/50 border-l-4 border-l-emerald-500 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-foreground mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                  <span>Điều khoản cam kết</span>
                </div>

                <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
                  {/* Checkbox 1 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...form.register('agreeHealth')}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer accent-[#0D3B2E]"
                    />
                    <span className="leading-relaxed group-hover:text-stone-900 dark:group-hover:text-foreground">
                      Tôi cam kết đủ sức khỏe và kinh nghiệm trekking cơ bản cho lộ trình này.
                    </span>
                  </label>
                  {form.formState.errors.agreeHealth && (
                    <p className="text-[11px] text-red-500 pl-7 font-medium">
                      {form.formState.errors.agreeHealth.message}
                    </p>
                  )}

                  {/* Checkbox 2 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...form.register('agreeRules')}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer accent-[#0D3B2E]"
                    />
                    <span className="leading-relaxed group-hover:text-stone-900 dark:group-hover:text-foreground">
                      Tôi đồng ý tuân thủ các quy tắc an toàn và hướng dẫn của trưởng đoàn trong
                      suốt chuyến đi.
                    </span>
                  </label>
                  {form.formState.errors.agreeRules && (
                    <p className="text-[11px] text-red-500 pl-7 font-medium">
                      {form.formState.errors.agreeRules.message}
                    </p>
                  )}

                  {/* Checkbox 3 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...form.register('agreeTerms')}
                      className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer accent-[#0D3B2E]"
                    />
                    <span className="leading-relaxed group-hover:text-stone-900 dark:group-hover:text-foreground">
                      Tôi đã đọc và đồng ý với Chính sách bảo mật và Điều khoản của TrekSphere.
                    </span>
                  </label>
                  {form.formState.errors.agreeTerms && (
                    <p className="text-[11px] text-red-500 pl-7 font-medium">
                      {form.formState.errors.agreeTerms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3.5 px-6 rounded-full border border-stone-400 dark:border-stone-600 bg-white dark:bg-card text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold hover:bg-stone-100 dark:hover:bg-muted transition-colors cursor-pointer text-center"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#0D3B2E] hover:bg-[#08271e] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Xác nhận gửi yêu cầu</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
