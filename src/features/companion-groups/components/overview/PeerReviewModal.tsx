import { CheckCircle2, ChevronRight, ShieldCheck, Star, Tag, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import type { GroupMember } from './MembersWorkspace';

interface PeerReviewModalProps {
  member: GroupMember;
  allMembers?: GroupMember[];
  reviewedMembers?: Record<string, ReviewData>;
  onClose: () => void;
  onSubmitReview: (memberId: string, ratingData: ReviewData) => void;
  onSelectMember?: (member: GroupMember) => void;
}

export interface ReviewData {
  punctualityScore: number;
  fitnessScore: number;
  financeScore: number;
  selectedTags: string[];
  comment: string;
}

const AVAILABLE_TAGS = [
  'Đồng đội tuyệt vời',
  'Cực kỳ đúng giờ',
  'Thể lực vượt trội',
  'Hậu cần chu đáo',
  'Nhiệt tình hỗ trợ',
  'Thợ chụp ảnh xịn',
  'Chu đáo an toàn',
  'Giao tiếp hòa đồng',
];

const SCORE_LABELS: Record<number, string> = {
  5: 'Xuất sắc',
  4: 'Tốt',
  3: 'Đạt yêu cầu',
  2: 'Cần cải thiện',
  1: 'Kém',
};

export function PeerReviewModal({
  member,
  allMembers = [],
  reviewedMembers = {},
  onClose,
  onSubmitReview,
  onSelectMember,
}: PeerReviewModalProps) {
  const existingReview = reviewedMembers[member.id];

  const [punctuality, setPunctuality] = useState(existingReview?.punctualityScore ?? 5);
  const [fitness, setFitness] = useState(existingReview?.fitnessScore ?? 5);
  const [finance, setFinance] = useState(existingReview?.financeScore ?? 5);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingReview?.selectedTags ?? []);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync state when selected member changes
  useEffect(() => {
    const rev = reviewedMembers[member.id];
    setPunctuality(rev?.punctualityScore ?? 5);
    setFitness(rev?.fitnessScore ?? 5);
    setFinance(rev?.financeScore ?? 5);
    setSelectedTags(rev?.selectedTags ?? []);
    setComment(rev?.comment ?? '');
    setIsSubmitted(false);
  }, [member.id, reviewedMembers]);

  const modalRef = useClickOutside<HTMLDivElement>(onClose);

  // Exclude current logged in user (assuming member is target, and others are group members)
  const peerList = allMembers.filter((m) => m.role !== 'Trưởng đoàn' || allMembers.length <= 4); // show peers
  const unreviewedCount = peerList.filter((m) => !reviewedMembers[m.id]).length;
  const reviewedCount = peerList.length - unreviewedCount;

  const nextUnreviewedMember = peerList.find((m) => m.id !== member.id && !reviewedMembers[m.id]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const calculateTrustBonus = () => {
    const avg = (punctuality + fitness + finance) / 3;
    if (avg >= 4.5) return '+2.5 điểm';
    if (avg >= 3.5) return '+1.5 điểm';
    if (avg >= 2.5) return '+0.5 điểm';
    return '0 điểm';
  };

  const handleSubmit = (e: React.FormEvent, proceedToNext = false) => {
    e.preventDefault();
    setIsSubmitted(true);

    onSubmitReview(member.id, {
      punctualityScore: punctuality,
      fitnessScore: fitness,
      financeScore: finance,
      selectedTags,
      comment,
    });

    setTimeout(() => {
      if (proceedToNext && nextUnreviewedMember && onSelectMember) {
        onSelectMember(nextUnreviewedMember);
      } else if (!nextUnreviewedMember) {
        onClose();
      } else {
        onClose();
      }
    }, 400);
  };

  const renderStarRating = (score: number, setScore: (val: number) => void) => (
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
                star <= score ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-xs font-semibold text-amber-600 min-w-[75px] text-right">
        {SCORE_LABELS[score]}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        {/* TOP BAR: TRIP PEER NAVIGATOR */}
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
                const isCurrent = m.id === member.id;
                const isDone = !!reviewedMembers[m.id];
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMember?.(m)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer shrink-0 border',
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                        : isDone
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 font-medium'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white',
                        m.avatarBg
                      )}
                    >
                      {m.avatar}
                    </div>
                    <span>{m.name}</span>
                    {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL MAIN HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white text-base shadow-sm',
                member.avatarBg
              )}
            >
              {member.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Đánh giá thành viên: {member.name}
                </h3>
                <span className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-md text-muted-foreground border border-border">
                  {member.role}
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

        {isSubmitted ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 animate-in zoom-in-50 duration-300" />
            <h4 className="text-base font-bold text-foreground">
              Đã ghi nhận đánh giá cho {member.name}!
            </h4>
            <p className="text-xs text-muted-foreground">
              Cảm ơn bạn đã đóng góp xây dựng cộng đồng TrekSphere minh bạch.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
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
                  <span className="text-xs font-bold text-foreground block">
                    2. Thể lực thực tế
                  </span>
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

            {/* QUICK TAGS / HUY HIỆU ĐẤN GIÁ */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                Gắn nhãn đặc điểm nổi bật (Tùy chọn)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer border',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
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
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                    Dự kiến tác động Trust Score: {calculateTrustBonus()}
                  </span>
                  <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 block">
                    Đánh giá từ bạn góp phần cập nhật chỉ số uy tín cộng đồng cho {member.name}
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
                  className="rounded-xl border border-primary text-primary hover:bg-primary/10 px-4 py-2 text-xs font-bold transition cursor-pointer"
                >
                  Lưu đánh giá này
                </button>

                {nextUnreviewedMember && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90 transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Chấm tiếp {nextUnreviewedMember.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
