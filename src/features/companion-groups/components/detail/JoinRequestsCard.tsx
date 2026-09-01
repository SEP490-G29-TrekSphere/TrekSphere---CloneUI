import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AppEmptyState } from '@/shared/ui';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import { JoinRequestProfileModal } from './JoinRequestProfileModal';
import { MemberAvatar } from './MemberAvatar';

export interface JoinRequestAction {
  id: string;
  userName: string;
  avatarUrl?: string;
}

interface JoinRequestsCardProps {
  requests: MatchingMemberItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onApprove: (req: JoinRequestAction) => void;
  onReject: (req: JoinRequestAction) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function JoinRequestsCard({
  requests,
  isLoading,
  isError,
  onRetry,
  onApprove,
  onReject,
  page,
  totalPages,
  totalElements,
  isLast,
  onPrevPage,
  onNextPage,
}: JoinRequestsCardProps) {
  const [viewingRequest, setViewingRequest] = useState<MatchingMemberItem | null>(null);

  return (
    <div className="rounded-2xl bg-card p-6 md:p-8 border border-border space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Duyệt thành viên xin vào nhóm</h2>
        <span className="text-xs font-semibold text-destructive">
          {totalElements} yêu cầu chờ xử lý
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-medium">Đang tải danh sách yêu cầu...</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-destructive font-medium">Không thể tải danh sách yêu cầu.</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-bold text-destructive underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && requests.length === 0 && (
        <AppEmptyState
          title="Không có yêu cầu nào"
          description="Chưa có yêu cầu tham gia mới nào."
        />
      )}

      {/* Join requests list */}
      {!isLoading &&
        !isError &&
        requests.map((req) => (
          <div
            key={req.matchingMemberId}
            className="rounded-xl border border-border bg-background p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MemberAvatar fullName={req.fullName} avatarUrl={req.avatarUrl} />
                <div>
                  <h3 className="text-xs font-bold text-foreground">{req.fullName}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Yêu cầu gia nhập{' '}
                    <span className="text-muted-foreground/60">
                      {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingRequest(req)}
                  className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Xem chi tiết
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onApprove({
                      id: req.matchingMemberId,
                      userName: req.fullName,
                      avatarUrl: req.avatarUrl,
                    })
                  }
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onReject({
                      id: req.matchingMemberId,
                      userName: req.fullName,
                      avatarUrl: req.avatarUrl,
                    })
                  }
                  className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>

            {req.message && (
              <p className="rounded-lg bg-muted/60 p-3 text-xs italic leading-relaxed text-muted-foreground">
                "{req.message}"
              </p>
            )}
          </div>
        ))}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={onPrevPage}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onNextPage}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {viewingRequest && (
        <JoinRequestProfileModal request={viewingRequest} onClose={() => setViewingRequest(null)} />
      )}
    </div>
  );
}
