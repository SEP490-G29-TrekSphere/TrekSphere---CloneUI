import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  useCancelDissolveRequest,
  useCreateDissolveRequest,
  useGroupDissolveRequest,
  useVoteDissolveRequest,
} from '../../hooks/useGroupDissolve';
import {
  useCancelSuccessionRequest,
  useCreateSuccessionRequest,
  useGroupSuccession,
  useVoteSuccessionRequest,
} from '../../hooks/useGroupSuccession';
import type { MatchingMemberItem } from '../../services/companionGroupService';

interface GroupSuccessionTabProps {
  groupId: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
  ownerId: string;
}

/**
 * Tab "Quản trị nhóm" — gồm 2 giao thức: Chuyển giao quyền Leader (tái hiện Leader Succession
 * Protocol trong WorkspacePreview story-flow, biểu quyết quá bán) và Giải tán nhóm (yêu cầu
 * TOÀN BỘ thành viên đồng thuận — leader không thể tự ý giải tán một mình).
 */
export function GroupSuccessionTab(props: GroupSuccessionTabProps) {
  return (
    <div className="space-y-6">
      <SuccessionSection {...props} />
      <DissolveSection {...props} />
    </div>
  );
}

function SuccessionSection({ groupId, isLeader, members, ownerId }: GroupSuccessionTabProps) {
  const user = useAppStore((state) => state.user);
  const { data: request, isLoading } = useGroupSuccession(groupId);
  const createRequest = useCreateSuccessionRequest(groupId);
  const vote = useVoteSuccessionRequest(groupId);
  const cancelRequest = useCancelSuccessionRequest(groupId);

  const otherMembers = members.filter((m) => m.userId !== ownerId && m.status === 'ACCEPTED');
  const [reason, setReason] = useState('');
  const [nomineeId, setNomineeId] = useState(otherMembers[0]?.userId ?? '');

  const myVote = request?.votes.find((v) => v.userId === user?.id)?.vote;
  const nomineeName =
    members.find((m) => m.userId === request?.nomineeId)?.fullName ?? 'Thành viên';
  const yesCount = request?.votes.filter((v) => v.vote === 'YES').length ?? 0;
  const requiredCount = Math.floor(members.filter((m) => m.status === 'ACCEPTED').length / 2) + 1;

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Đang tải...</p>;
  }

  return (
    <div className="space-y-5 rounded-2xl border border-secondary bg-secondary/30 p-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-secondary/40 pb-4">
        <RefreshCw className="h-6 w-6 shrink-0 text-primary" />
        <div>
          <h4 className="text-base font-extrabold text-primary">
            Giao thức chuyển giao quyền Leader
          </h4>
          <p className="text-xs text-muted-foreground">
            Cần hơn 50% thành viên đồng ý ({requiredCount}/
            {members.filter((m) => m.status === 'ACCEPTED').length} phiếu) để chuyển giao thành
            công.
          </p>
        </div>
      </div>

      {!request ? (
        isLeader ? (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block font-bold text-foreground">
                Lý do xin chuyển giao quyền Leader:
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Bận công tác đột xuất / Gặp chấn thương nhẹ không kịp phục hồi..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-foreground">
                Đề xuất Leader mới thay thế:
              </label>
              <select
                value={nomineeId}
                onChange={(e) => setNomineeId(e.target.value)}
                disabled={otherMembers.length === 0}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none"
              >
                {otherMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!reason.trim() || !nomineeId || createRequest.isPending}
              onClick={() => createRequest.mutate({ reason: reason.trim(), nomineeId })}
              className="w-full rounded-full bg-primary px-6 py-3 font-extrabold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-50"
            >
              Kích hoạt đề xuất chuyển giao & biểu quyết
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Chưa có yêu cầu chuyển giao Leader nào đang diễn ra.
          </p>
        )
      ) : request.status === 'APPROVED' ? (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-background p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
          <h5 className="text-sm font-extrabold text-primary">
            Đã chuyển giao quyền Leader cho {nomineeName}!
          </h5>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-secondary/40 bg-background p-4 space-y-1">
            <p className="font-bold text-foreground">Lý do: {request.reason}</p>
            <p className="text-muted-foreground">
              Đề xuất Leader mới: <strong className="text-foreground">{nomineeName}</strong>
            </p>
            <p className="text-muted-foreground">
              Đã có {yesCount}/{requiredCount} phiếu đồng ý cần thiết.
            </p>
          </div>

          {myVote ? (
            <p className="rounded-xl bg-background border border-secondary/40 p-3 text-center font-bold text-foreground">
              Bạn đã bầu: {myVote === 'YES' ? 'Đồng ý' : 'Không đồng ý'}
            </p>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={vote.isPending}
                onClick={() => vote.mutate({ requestId: request.id, vote: 'YES' })}
                className="flex-1 rounded-full bg-primary py-2.5 font-extrabold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                Đồng ý
              </button>
              <button
                type="button"
                disabled={vote.isPending}
                onClick={() => vote.mutate({ requestId: request.id, vote: 'NO' })}
                className="flex-1 rounded-full border border-border py-2.5 font-bold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Không đồng ý
              </button>
            </div>
          )}

          {isLeader && (
            <button
              type="button"
              disabled={cancelRequest.isPending}
              onClick={() => cancelRequest.mutate()}
              className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline"
            >
              Hủy đề xuất chuyển giao
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DissolveSection({ groupId, isLeader, members }: GroupSuccessionTabProps) {
  const user = useAppStore((state) => state.user);
  const { data: request, isLoading } = useGroupDissolveRequest(groupId);
  const createRequest = useCreateDissolveRequest(groupId);
  const vote = useVoteDissolveRequest(groupId);
  const cancelRequest = useCancelDissolveRequest(groupId);

  const [reason, setReason] = useState('');
  const acceptedCount = members.filter((m) => m.status === 'ACCEPTED').length;
  const myVote = request?.votes.find((v) => v.userId === user?.id)?.vote;
  const yesCount = request?.votes.filter((v) => v.vote === 'YES').length ?? 0;
  const requiredCount = request?.requiredVotes ?? acceptedCount;

  if (isLoading) return null;

  return (
    <div className="space-y-5 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
        <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
        <div>
          <h4 className="text-base font-extrabold text-destructive">Giải tán nhóm</h4>
          <p className="text-xs text-muted-foreground">
            Cần <strong className="text-foreground">100% thành viên đồng ý</strong> ({acceptedCount}
            /{acceptedCount} phiếu) — chỉ cần 1 người không đồng ý là yêu cầu bị huỷ ngay. Hành động
            không thể hoàn tác.
          </p>
        </div>
      </div>

      {request?.status !== 'OPEN' ? (
        isLeader ? (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="block font-bold text-foreground">Lý do giải tán nhóm:</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Chuyến đi không thể diễn ra như dự kiến, cả nhóm đã thống nhất huỷ..."
                className="w-full rounded-xl border border-destructive/30 bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-destructive"
              />
            </div>
            <button
              type="button"
              disabled={!reason.trim() || createRequest.isPending}
              onClick={() => createRequest.mutate(reason.trim())}
              className="w-full rounded-full bg-destructive px-6 py-3 font-extrabold text-destructive-foreground shadow-md transition hover:bg-destructive/90 disabled:opacity-50"
            >
              Gửi yêu cầu giải tán & lấy biểu quyết
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Chưa có yêu cầu giải tán nhóm nào đang diễn ra.
          </p>
        )
      ) : (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-destructive/30 bg-background p-4 space-y-1">
            <p className="font-bold text-foreground">Lý do: {request.reason}</p>
            <p className="text-muted-foreground">
              Đã có {yesCount}/{requiredCount} phiếu đồng ý — cần đủ 100% mới giải tán được.
            </p>
          </div>

          {myVote ? (
            <p className="rounded-xl border border-destructive/30 bg-background p-3 text-center font-bold text-destructive">
              Bạn đã bầu: {myVote === 'YES' ? 'Đồng ý giải tán' : 'Không đồng ý'}
            </p>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={vote.isPending}
                onClick={() => vote.mutate({ requestId: request.id, vote: 'YES' })}
                className="flex-1 rounded-full bg-destructive py-2.5 font-extrabold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                Đồng ý giải tán
              </button>
              <button
                type="button"
                disabled={vote.isPending}
                onClick={() => vote.mutate({ requestId: request.id, vote: 'NO' })}
                className="flex-1 rounded-full border border-border py-2.5 font-bold text-foreground hover:bg-muted disabled:opacity-50"
              >
                Không đồng ý
              </button>
            </div>
          )}

          {isLeader && (
            <button
              type="button"
              disabled={cancelRequest.isPending}
              onClick={() => cancelRequest.mutate()}
              className="text-xs font-bold text-destructive hover:underline"
            >
              Hủy yêu cầu giải tán
            </button>
          )}
        </div>
      )}
    </div>
  );
}
