import {
  CheckCircle2,
  CheckSquare,
  Clock,
  MessageSquare,
  Pin,
  Radio,
  RotateCcw,
  Send,
  ShieldAlert,
  Siren,
  SkipForward,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  useCheckInCheckpoint,
  useGroupCheckpoints,
  useSkipCheckpoint,
} from '../../hooks/useGroupCheckpoints';
import { useCreateFeedPost, useGroupFeed, useToggleFeedPostLike } from '../../hooks/useGroupFeed';
import type { GroupLifecyclePhase } from '../../services/groupWorkspaceService';
import { GroupSOSModal } from './GroupSOSModal';

interface GroupWorkspaceOverviewTabProps {
  groupId: string;
  phase: GroupLifecyclePhase;
  isLeader: boolean;
}

/** Tab "Tổng quan" của Workspace: Live tracking/checkpoints (giai đoạn 4) + Bảng tin nhóm + SOS Dọc đường. */
export function GroupWorkspaceOverviewTab({
  groupId,
  phase,
  isLeader,
}: GroupWorkspaceOverviewTabProps) {
  const { data: checkpoints = [] } = useGroupCheckpoints(groupId);
  const checkIn = useCheckInCheckpoint(groupId);
  const skip = useSkipCheckpoint(groupId);

  const { data: posts = [], isLoading: isFeedLoading } = useGroupFeed(groupId);
  const createPost = useCreateFeedPost(groupId);
  const toggleLike = useToggleFeedPostLike(groupId);
  const [newPostText, setNewPostText] = useState('');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [resolvedSosIds, setResolvedSosIds] = useState<string[]>([]);

  const handleToggleResolveSos = (postId: string) => {
    setResolvedSosIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    createPost.mutate(newPostText.trim(), { onSuccess: () => setNewPostText('') });
  };

  return (
    <div className="space-y-6">
      {/* BANNER SOS CỨU HỘ DỌC ĐƯỜNG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground animate-pulse">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-destructive uppercase tracking-wide">
                Trợ Giúp Khẩn Cấp & SOS Dọc Đường
              </span>
              <span className="rounded-md bg-destructive/20 px-1.5 py-0.5 text-[9.5px] font-bold text-destructive">
                Cứu hộ 24/7
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Phát tín hiệu cảnh báo vị trí GPS tới nhóm hoặc truy cập số Hotline cứu hộ y tế & kiểm lâm địa phương.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSosModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2 text-xs font-black text-destructive-foreground shadow-sm hover:bg-destructive/90 transition"
        >
          <Siren className="h-4 w-4" /> Phát Tín Hiệu SOS
        </button>
      </div>

      {/* TIẾN TRÌNH LỘ TRÌNH (Phase 4: On-going) */}
      {phase === 4 && checkpoints.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" /> Nhật Ký Tiến Trình Hành Trình
              </h3>
              <p className="text-xs text-muted-foreground">
                Cập nhật các điểm Checkpoint thực tế trên tuyến trekking.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600">
              Đang diễn ra (Live)
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {checkpoints.map((cpItem, idx) => {
              const cp = cpItem as any;
              const isDone = cp.status === 'COMPLETED' || cp.status === 'PASSED';
              const isSkipped = cp.status === 'SKIPPED';
              const isPending = !isDone && !isSkipped;

              return (
                <div
                  key={cp.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition',
                    isDone
                      ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : isSkipped
                      ? 'border-muted bg-muted/30 opacity-60'
                      : 'border-border bg-background'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isSkipped
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-foreground">{cp.name}</strong>
                        {cp.estimatedTime && (
                          <span className="text-[10px] text-muted-foreground">({cp.estimatedTime})</span>
                        )}
                      </div>
                      {cp.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{cp.description}</p>
                      )}
                      {cp.checkInTime && (
                        <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                          ✓ Check-in lúc: {new Date(cp.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {isLeader && isPending && (
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => checkIn.mutate(cp.id)}
                        disabled={checkIn.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Check-in
                      </button>
                      <button
                        type="button"
                        onClick={() => skip.mutate(cp.id)}
                        disabled={skip.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition"
                      >
                        <SkipForward className="h-3.5 w-3.5" /> Bỏ qua
                      </button>
                    </div>
                  )}

                  {!isLeader && isPending && (
                    <span className="text-[11px] font-semibold text-muted-foreground self-end sm:self-center">
                      Chờ Trưởng nhóm điểm danh...
                    </span>
                  )}

                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 shrink-0 self-end sm:self-center">
                      <CheckCircle2 className="h-4 w-4" /> Đã qua
                    </span>
                  )}
                  {isSkipped && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0 self-end sm:self-center">
                      <XCircle className="h-4 w-4" /> Đã bỏ qua
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORM TẠO BÀI ĐĂNG TRÊN BẢNG TIN */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <textarea
          rows={2}
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Chia sẻ thông tin, hình ảnh hoặc câu hỏi cho các thành viên trong nhóm..."
          className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsSosModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive hover:underline"
          >
            <ShieldAlert className="h-4 w-4" /> Gửi cảnh báo SOS khẩn cấp
          </button>
          <button
            type="button"
            onClick={handleCreatePost}
            disabled={!newPostText.trim() || createPost.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <Send className="h-3.5 w-3.5" /> Đăng tin
          </button>
        </div>
      </div>

      {/* BẢNG TIN NHÓM (FEED POSTS) */}
      <div className="space-y-4">
        {isFeedLoading && <p className="text-xs text-muted-foreground">Đang tải bảng tin...</p>}
        {!isFeedLoading && posts.length === 0 && (
          <p className="text-xs text-muted-foreground">Chưa có bài đăng nào trong nhóm.</p>
        )}
        {/* Tự động sắp xếp: Bài đăng SOS & Thông báo quan trọng luôn ghim lên ĐẦU BẢNG TIN */}
        {[...posts]
          .sort((a, b) => {
            const isASos = a.content.includes('SOS') || a.isAnnouncement;
            const isBSos = b.content.includes('SOS') || b.isAnnouncement;
            if (isASos && !isBSos) return -1;
            if (!isASos && isBSos) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .map((post) => {
            const isSos = post.content.includes('SOS') || post.content.includes('CẢNH BÁO');
            const isResolved = resolvedSosIds.includes(post.id);

            return (
              <div
                key={post.id}
                className={cn(
                  'space-y-3 rounded-2xl border p-5 transition shadow-xs',
                  isSos && !isResolved
                    ? 'border-2 border-destructive bg-destructive/10 shadow-md ring-2 ring-destructive/20'
                    : isSos && isResolved
                    ? 'border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : post.isAnnouncement
                    ? 'border-secondary/40 bg-secondary/10'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {post.authorAvatarUrl ? (
                      <img
                        src={post.authorAvatarUrl}
                        alt={post.authorName}
                        className={cn(
                          'h-9 w-9 rounded-full object-cover',
                          isSos && !isResolved && 'ring-2 ring-destructive',
                          isSos && isResolved && 'ring-2 ring-emerald-500'
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                          isSos && !isResolved
                            ? 'bg-destructive text-destructive-foreground font-black'
                            : isSos && isResolved
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-secondary text-secondary-foreground'
                        )}
                      >
                        {post.authorName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <strong
                          className={cn(
                            'text-xs font-extrabold',
                            isSos && !isResolved
                              ? 'text-destructive font-black'
                              : isSos && isResolved
                              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                              : 'text-foreground'
                          )}
                        >
                          {post.authorName}
                        </strong>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-bold',
                            isSos && !isResolved
                              ? 'bg-destructive text-destructive-foreground'
                              : isSos && isResolved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {post.authorRole}
                        </span>
                      </div>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {new Date(post.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Badge Ghim Thông Báo / SOS */}
                  {isSos && !isResolved ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-[11px] font-black text-destructive-foreground shadow-sm animate-pulse">
                      <Siren className="h-3.5 w-3.5" /> 🚨 TÍN HIỆU SOS (ĐÃ GHIM NỔI BẬT)
                    </span>
                  ) : isSos && isResolved ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> ✅ SOS ĐÃ XỬ LÝ (AN TOÀN)
                    </span>
                  ) : post.isAnnouncement ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-extrabold text-secondary-foreground">
                      <Pin className="h-3 w-3" /> Thông báo nhóm
                    </span>
                  ) : null}
                </div>

                <p
                  className={cn(
                    'whitespace-pre-line text-xs leading-relaxed',
                    isSos && !isResolved
                      ? 'font-bold text-foreground bg-background/80 p-3 rounded-xl border border-destructive/30'
                      : isSos && isResolved
                      ? 'text-foreground/90 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30'
                      : 'text-foreground/90'
                  )}
                >
                  {post.content}
                </p>

                <div className="flex flex-wrap items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLike.mutate(post.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition hover:bg-muted',
                        post.likedByMe && 'text-primary'
                      )}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {post.likeCount} Yêu thích
                    </button>
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentsCount} Thảo luận
                    </span>
                  </div>

                  {/* Nút đánh dấu Đã Xử Lý cho người đăng / Leader */}
                  {isSos && (
                    <button
                      type="button"
                      onClick={() => handleToggleResolveSos(post.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs',
                        isResolved
                          ? 'border border-border bg-background text-muted-foreground hover:bg-muted'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      )}
                    >
                      {isResolved ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" /> Mở lại tín hiệu SOS
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Đánh dấu đã xử lý (An toàn)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {isLeader && phase < 5 && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5" /> Bạn có thể chuyển giai đoạn nhóm ở banner phía
          trên khi hành trình tiến triển.
        </p>
      )}

      {/* MODAL SOS KHẨN CẤP */}
      <GroupSOSModal
        groupId={groupId}
        isOpen={isSosModalOpen}
        isLeader={isLeader}
        onClose={() => setIsSosModalOpen(false)}
      />
    </div>
  );
}
