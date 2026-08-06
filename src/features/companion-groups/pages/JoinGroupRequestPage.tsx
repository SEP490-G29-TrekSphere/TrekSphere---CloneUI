import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Calendar, CheckCircle2, Loader2, ShieldCheck, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PATHS } from '@/constants/paths';
import { AppButton } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { formatDate } from '@/utils/format';
import { useJoinMatchingGroup } from '../hooks/useJoinMatchingGroup';
import { useMatchingGroupDetail } from '../hooks/useMatchingGroupDetail';

const joinRequestSchema = z.object({
  message: z.string().min(1, 'Vui lòng nhập lời nhắn gửi đến trưởng nhóm'),
});

type JoinRequestFormValues = z.infer<typeof joinRequestSchema>;

export default function JoinGroupRequestPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const { data: groupData, isLoading, isError } = useMatchingGroupDetail(groupId);
  const joinMutation = useJoinMatchingGroup();
  const user = useAppStore((state) => state.user);

  const form = useForm<JoinRequestFormValues>({
    resolver: zodResolver(joinRequestSchema),
    defaultValues: {
      message: '',
    },
  });

  // Redirect if current user is the owner of the group
  useEffect(() => {
    if (user && groupData && groupData.ownerId === user.id) {
      navigate(`/groups/${groupId}`, { replace: true });
    }
  }, [user, groupData, groupId, navigate]);

  if (user && groupData && groupData.ownerId === user.id) {
    return null;
  }

  const existingMember = groupData?.members?.find((m) => m.userId === user?.id);

  const onSubmit = () => {
    if (!groupId) return;

    joinMutation.mutate(groupId, {
      onSuccess: () => {
        toast.success(
          'Đã gửi yêu cầu tham gia thành công! Trưởng nhóm sẽ xét duyệt yêu cầu của bạn.'
        );
        navigate(`/groups/${groupId}`);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu tham gia.');
      },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F4EB] dark:bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-800 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Đang tải thông tin nhóm ghép...</p>
      </div>
    );
  }

  if (isError || !groupData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F7F4EB] dark:bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-card p-8 rounded-3xl border border-red-100 dark:border-border shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-[#0B3025] dark:text-foreground">
            Không thể tải thông tin nhóm
          </h2>
          <p className="text-xs text-zinc-500 dark:text-muted-foreground leading-relaxed">
            Nhóm ghép bạn đang tìm kiếm không tồn tại hoặc đã bị giải tán.
          </p>
          <div className="pt-2">
            <AppButton
              onClick={() => navigate(PATHS.GROUPS)}
              className="bg-[#0B3025] hover:bg-[#072019] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-sm border-none cursor-pointer"
            >
              Quay lại danh sách
            </AppButton>
          </div>
        </div>
      </div>
    );
  }

  // Filter accepted members to display in current members section
  const acceptedMembers = groupData.members?.filter((m) => m.status === 'ACCEPTED') || [];
  // Max members
  const maxSize = groupData.maxSize || 10;
  const currentSize = acceptedMembers.length;

  return (
    <div className="min-h-screen bg-[#F7F4EB] dark:bg-background pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Container Khung Trắng Viền Bo Tròn (Giống hình thiết kế) */}
      <div className="bg-[#FAF8F5] dark:bg-card border border-stone-200/80 dark:border-border rounded-[2.5rem] p-6 sm:p-10 max-w-5xl w-full shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: Thông tin Tour & Danh sách thành viên hiện tại */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card Tour */}
            <div className="bg-[#F0EBE1] dark:bg-muted/40 rounded-[2rem] p-5 border border-stone-200/60 dark:border-border/50 shadow-xs space-y-4">
              {/* Chi tiết Tour */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#A3E6BA] text-[#0D3B2E] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    {groupData.status === 'OPEN'
                      ? 'Đang tuyển'
                      : groupData.status === 'FULL'
                        ? 'Đã đủ'
                        : 'Đã đóng'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-foreground leading-snug">
                  {groupData.groupName}
                </h2>

                <div className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-muted-foreground">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span>Khởi hành: {formatDate(groupData.targetDate)}</span>
                </div>

                <div className="pt-2 border-t border-stone-300/40 dark:border-border/40 flex items-center justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                    <span>
                      Trưởng nhóm: <strong className="font-semibold">{groupData.ownerName}</strong>
                    </span>
                  </div>
                  <span className="bg-[#E4DCD0] dark:bg-muted text-stone-800 dark:text-stone-200 font-bold px-3 py-1 rounded-full text-xs">
                    {currentSize}/{maxSize} Thành viên
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
                {acceptedMembers.slice(0, 5).map((member) => {
                  const isLeader = member.role === 'OWNER';
                  const initials = member.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div key={member.matchingMemberId} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-card shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-muted text-emerald-900 dark:text-stone-300 flex items-center justify-center font-bold text-xs shadow-xs border-2 border-white dark:border-card">
                            {initials}
                          </div>
                        )}
                        {isLeader && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-white text-[9px] font-bold">
                            ★
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300 truncate w-full">
                        {member.fullName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Hiển thị số lượng thêm (+X Khác) */}
              {acceptedMembers.length > 5 && (
                <div className="flex justify-start">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full bg-stone-200 dark:bg-muted text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-xs shadow-xs">
                      +{acceptedMembers.length - 5}
                    </div>
                    <span className="text-[11px] font-medium text-stone-500 dark:text-muted-foreground">
                      Khác
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: Form Gửi yêu cầu tham gia hoặc Trạng thái yêu cầu */}
          <div className="lg:col-span-7 space-y-6">
            {existingMember &&
            (existingMember.status === 'PENDING' || existingMember.status === 'ACCEPTED') ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-foreground tracking-tight">
                    {existingMember.status === 'PENDING'
                      ? 'Yêu cầu đang chờ duyệt'
                      : 'Đã tham gia nhóm'}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-muted-foreground mt-1 leading-relaxed">
                    {existingMember.status === 'PENDING'
                      ? 'Bạn đã gửi yêu cầu tham gia nhóm ghép này rồi. Vui lòng chờ trưởng nhóm xét duyệt.'
                      : 'Bạn đã là thành viên chính thức của nhóm ghép này.'}
                  </p>
                </div>

                <div className="bg-white dark:bg-card rounded-[2rem] p-6 border border-stone-200/60 dark:border-border/50 text-center space-y-4 shadow-2xs">
                  <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    {existingMember.status === 'PENDING'
                      ? 'Yêu cầu của bạn đang ở trạng thái chờ duyệt.'
                      : 'Bạn đã tham gia nhóm thành công.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/groups/${groupId}`)}
                    className="px-6 py-2.5 rounded-full bg-[#0D3B2E] text-xs font-bold text-white hover:bg-emerald-950 transition-colors cursor-pointer"
                  >
                    Xem chi tiết nhóm
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-foreground tracking-tight">
                    Gửi yêu cầu tham gia
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-muted-foreground mt-1 leading-relaxed">
                    Vui lòng giới thiệu bản thân và chấp nhận các điều khoản để trưởng nhóm xét
                    duyệt.
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      type="button"
                      disabled={joinMutation.isPending}
                      onClick={handleCancel}
                      className="flex-1 py-3.5 px-6 rounded-full border border-stone-400 dark:border-stone-600 bg-white dark:bg-card text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-bold hover:bg-stone-100 dark:hover:bg-muted transition-colors cursor-pointer text-center disabled:opacity-55"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={joinMutation.isPending}
                      className="flex-1 py-3.5 px-6 rounded-full bg-[#0D3B2E] hover:bg-[#08271e] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-55"
                    >
                      {joinMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <span>Xác nhận gửi yêu cầu</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
