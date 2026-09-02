import { CheckCircle2, ChevronRight, ShieldCheck, Star, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import type { PeerReviewPayload, WorkspaceMemberItem } from '../../services/groupWorkspaceService';

interface GroupPeerReviewModalProps {
  member: WorkspaceMemberItem;
  allMembers: WorkspaceMemberItem[];
  reviewedIds: Set<string>;
  onClose: () => void;
  onSubmit: (payload: PeerReviewPayload) => void;
  isSubmitting: boolean;
  onSelectMember: (member: WorkspaceMemberItem) => void;
}

const SCORE_LABELS: Record<number, string> = {
  5: 'Xuất sắc',
  4: 'Tốt',
  3: 'Đạt yêu cầu',
  2: 'Cần cải thiện',
  1: 'Kém',
};

/** Avatar-fallback initials circle uses a single consistent token pair (no rainbow rotation). */
const AVATAR_FALLBACK_CLASS = 'bg-secondary text-secondary-foreground';

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/**
 * Form Peer Review tái hiện `PeerReviewModal.tsx` (story-flow mockup) nhưng nối dữ liệu thật:
 * cha (`GroupMembersWorkspace`) sở hữu mutation `useSubmitPeerReview` và quyết định điều hướng
 * (đóng modal hay chuyển sang thành viên chưa đánh giá tiếp theo) sau khi gọi `onSubmit`.
 *
 * Cha render component này với `key={member.userId}` nên mỗi lần "peer navigator" nhảy sang
 * thành viên khác, component được remount và form quay lại giá trị mặc định (5 sao) thay vì
 * cần một `useEffect` đồng bộ thủ công.
 */
export function GroupPeerReviewModal({
  member,
  allMembers,
  reviewedIds,
  onClose,
  onSubmit,
  isSubmitting,
  onSelectMember,
}: GroupPeerReviewModalProps) {
  const [punctuality, setPunctuality] = useState(5);
  const [fitness, setFitness] = useState(5);
  const [finance, setFinance] = useState(5);
  const [comment, setComment] = useState('');

  const modalRef = useClickOutside<HTMLDivElement>(onClose);

  const peerList = allMembers;
  const reviewedCount = peerList.filter((m) => reviewedIds.has(m.userId)).length;

  const nextUnreviewedMember = peerList.find(
    (m) => m.userId !== member.userId && !reviewedIds.has(m.userId)
  );

  function calculateTrustBonus() {
    const avg = (punctuality + fitness + finance) / 3;
    if (avg >= 4.5) return '+2.5 điểm';
    if (avg >= 3.5) return '+1.5 điểm';
    if (avg >= 2.5) return '+0.5 điểm';
    return '0 điểm';
  }

  function buildPayload(): PeerReviewPayload {
    return {
      revieweeId: member.userId,
      punctualityScore: punctuality,
      fitnessScore: fitness,
      financeScore: finance,
      tags: [],
      comment: comment.trim() || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(buildPayload());
    onClose();
  }

  function handleSubmitAndNext(e: React.MouseEvent) {
    e.preventDefault();
    onSubmit(buildPayload());
    if (nextUnreviewedMember) {
      onSelectMember(nextUnreviewedMember);
    } else {
      onClose();
    }
  }

  function renderStarRating(score: number, setScore: (val: number) => void) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              className="p-0.5 transition hover:scale-110 cursor-pointer"
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-colors',
                  star <= score ? 'text-primary fill-primary' : 'text-muted-foreground/30'
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-primary min-w-[75px] text-right">
          {SCORE_LABELS[score]}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        {/* TOP BAR: PEER NAVIGATOR */}
        {peerList.length > 1 && (
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                Danh sách đánh giá thành viên
              </span>
              <span className="text-[11px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                Đã hoàn thành {reviewedCount}/{peerList.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {peerList.map((m) => {
                const isCurrent = m.userId === member.userId;
                const isDone = reviewedIds.has(m.userId);
                return (
                  <button
                    key={m.userId}
                    type="button"
                    onClick={() => onSelectMember(m)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer shrink-0 border',
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                        : isDone
                          ? 'border-border bg-muted text-foreground font-medium'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                          AVATAR_FALLBACK_CLASS
                        )}
                      >
                        {getInitial(m.fullName)}
                      </div>
                    )}
                    <span>{m.fullName}</span>
                    {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL MAIN HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="h-11 w-11 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl font-bold text-base shadow-sm',
                  AVATAR_FALLBACK_CLASS
                )}
              >
                {getInitial(member.fullName)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Đánh giá thành viên: {member.fullName}
                </h3>
                <span className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-md text-muted-foreground border border-border">
                  {member.roleLabel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đánh giá khách quan để tính điểm uy tín (Trust Score) cho chuyến đi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 3 CORE BUSINESS CRITERIA SECTION */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Tiêu chí đánh giá bắt buộc
            </h4>

            {/* 1. Punctuality */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  1. Đúng giờ & Trách nhiệm
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Tuân thủ thời gian tập trung & lịch trình chung
                </span>
              </div>
              {renderStarRating(punctuality, setPunctuality)}
            </div>

            {/* 2. Fitness */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40 pt-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">2. Thể lực thực tế</span>
                <span className="text-[11px] text-muted-foreground block">
                  Theo kịp tốc độ đoàn & khả năng tự tải đồ / hỗ trợ
                </span>
              </div>
              {renderStarRating(fitness, setFitness)}
            </div>

            {/* 3. Financial Settlement */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40 pt-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  3. Minh bạch tài chính
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Sòng phẳng chi phí cá nhân & đóng góp tiền quỹ
                </span>
              </div>
              {renderStarRating(finance, setFinance)}
            </div>
          </div>

          {/* COMMENT TEXTAREA */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Nhận xét chi tiết</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm đồng hành cùng thành viên này trong chuyến đi..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* TRUST SCORE IMPACT PREVIEW BOX */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-xs font-bold text-primary block">
                  Dự kiến tác động Trust Score: {calculateTrustBonus()}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Đánh giá từ bạn góp phần cập nhật chỉ số uy tín cộng đồng cho {member.fullName}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition cursor-pointer"
            >
              Hủy
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl border border-primary text-primary hover:bg-primary/10 px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Lưu đánh giá này
              </button>

              {nextUnreviewedMember && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitAndNext}
                  className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                >
                  <span>Chấm tiếp {nextUnreviewedMember.fullName}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
