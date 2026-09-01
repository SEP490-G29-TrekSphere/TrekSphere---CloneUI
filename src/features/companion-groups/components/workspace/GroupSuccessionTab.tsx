import { AlertTriangle, Check, Clock, RefreshCw, ShieldAlert, UserCog, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import {
  useCancelDissolveRequest,
  useCreateDissolveRequest,
  useGroupDissolveRequest,
  useVoteDissolveRequest,
} from '../../hooks/useGroupDissolve';
import {
  useAppointLeaderDirect,
  useCancelSuccessionRequest,
  useCreateSuccessionRequest,
  useGroupSuccession,
  useVoteSuccessionRequest,
} from '../../hooks/useGroupSuccession';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import type { GroupLifecyclePhase } from '../../services/groupWorkspaceService';
import { MemberAvatar } from '../detail/MemberAvatar';
import { GroupMembersWorkspace } from './GroupMembersWorkspace';
import { GroupTripStatusPanel } from './GroupTripStatusPanel';

interface GroupSuccessionTabProps {
  groupId: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
  ownerId: string;
  tripStatus: 'ONGOING' | 'COMPLETED';
  phase: GroupLifecyclePhase;
}

/**
 * Tab "Quản trị nhóm" — gồm bảng danh sách thành viên đầy đủ (Trust Score, hồ sơ y tế, Peer
 * Review — chuyển từ tab "Thành viên" sang đây) và 2 giao thức quản trị đúng nghiệp vụ đã định
 * nghĩa trong Business_Specification_v2.2.md:
 *  - MODULE 4 (Leader Succession Protocol): Trường hợp A "Chỉ định trực tiếp" (không cần bầu)
 *    và Trường hợp B "Mở Poll 24h" (>50% phiếu YES, quá hạn không đủ phiếu → nhóm tự huỷ).
 *  - Giải tán nhóm: bỏ phiếu trực quan, cần TOÀN BỘ thành viên đồng thuận.
 */
export function GroupSuccessionTab({
  groupId,
  isLeader,
  members,
  ownerId,
  tripStatus,
  phase,
}: GroupSuccessionTabProps) {
  return (
    <div className="space-y-6">
      <GroupTripStatusPanel groupId={groupId} isLeader={isLeader} tripStatus={tripStatus} />
      <GroupMembersWorkspace groupId={groupId} isLeader={isLeader} tripStatus={tripStatus} />
      <SuccessionSection
        groupId={groupId}
        isLeader={isLeader}
        members={members}
        ownerId={ownerId}
        phase={phase}
      />
      <DissolveSection groupId={groupId} isLeader={isLeader} members={members} ownerId={ownerId} />
    </div>
  );
}

/** Danh sách avatar + trạng thái phiếu bầu — cho cả 2 giao thức để việc bỏ phiếu trực quan hơn. */
function VoteRoster({
  members,
  votes,
  accent,
}: {
  members: MatchingMemberItem[];
  votes: { userId: string; vote: 'YES' | 'NO' }[];
  accent: 'primary' | 'destructive';
}) {
  const accepted = members.filter((m) => m.status === 'ACCEPTED');
  return (
    <div className="flex flex-wrap gap-1.5">
      {accepted.map((m) => {
        const v = votes.find((vv) => vv.userId === m.userId)?.vote;
        return (
          <div
            key={m.userId}
            title={m.fullName}
            className={cn(
              'flex items-center gap-1.5 rounded-full border pl-1 pr-2.5 py-1 text-[10.5px] font-bold',
              v === 'YES' &&
                (accent === 'destructive'
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : 'border-primary/40 bg-primary/10 text-primary'),
              v === 'NO' && 'border-destructive/40 bg-destructive/10 text-destructive',
              !v && 'border-border bg-muted text-muted-foreground'
            )}
          >
            <MemberAvatar fullName={m.fullName} avatarUrl={m.avatarUrl} size="sm" />
            <span className="max-w-[90px] truncate">{m.fullName}</span>
            {v === 'YES' && <Check className="h-3 w-3 shrink-0" />}
            {v === 'NO' && <X className="h-3 w-3 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

/** Thanh tiến độ phiếu bầu YES/tổng số phiếu cần — trực quan hoá % đạt được so với ngưỡng. */
function VoteProgressBar({
  yesCount,
  requiredCount,
  accent,
}: {
  yesCount: number;
  requiredCount: number;
  accent: 'primary' | 'destructive';
}) {
  const pct = requiredCount > 0 ? Math.min(100, Math.round((yesCount / requiredCount) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
        <span>
          {yesCount}/{requiredCount} phiếu đồng ý cần thiết
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            accent === 'destructive' ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatTimeLeft(deadline: string): string {
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return 'Đã hết hạn';
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
  return `còn ${hours}h${minutes}p`;
}

function SuccessionSection({
  groupId,
  isLeader,
  members,
  ownerId,
  phase,
}: Omit<GroupSuccessionTabProps, 'tripStatus'>) {
  const user = useAppStore((state) => state.user);
  const { data: request, isLoading } = useGroupSuccession(groupId);
  const appointDirect = useAppointLeaderDirect(groupId);
  const createPoll = useCreateSuccessionRequest(groupId);
  const vote = useVoteSuccessionRequest(groupId);
  const cancelRequest = useCancelSuccessionRequest(groupId);

  const otherMembers = members.filter((m) => m.userId !== ownerId && m.status === 'ACCEPTED');
  const [reason, setReason] = useState('');
  const [directNomineeId, setDirectNomineeId] = useState(otherMembers[0]?.userId ?? '');
  const [pollNomineeId, setPollNomineeId] = useState(otherMembers[0]?.userId ?? '');

  const myVote = request?.votes.find((v) => v.userId === user?.id)?.vote;
  const nomineeName =
    members.find((m) => m.userId === request?.nomineeId)?.fullName ?? 'Thành viên';
  const acceptedCount = members.filter((m) => m.status === 'ACCEPTED').length;
  const yesCount = request?.votes.filter((v) => v.vote === 'YES').length ?? 0;
  const requiredCount = Math.floor(acceptedCount / 2) + 1;

  // BR-LEAD-01: không cho phép chuyển giao Leader khi chuyến đi đang IN_PROGRESS (phase 4).
  const blockedByPhase = phase === 4;

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
            Chỉ định trực tiếp 1 người uy tín, hoặc mở bình chọn 24h cần hơn 50% thành viên đồng ý.
          </p>
        </div>
      </div>

      {blockedByPhase && !request && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] font-bold text-amber-800 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Không thể chuyển giao Leader khi chuyến đi đang diễn ra (BR-LEAD-01).
        </div>
      )}

      {!request ? (
        isLeader ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* TRƯỜNG HỢP A: CHỈ ĐỊNH TRỰC TIẾP */}
            <div className="space-y-3 rounded-xl border border-primary/30 bg-background p-4 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-primary">
                <UserCog className="h-4 w-4" />
                Chỉ định trực tiếp
              </div>
              <p className="text-[11px] text-muted-foreground">
                Chuyển giao ngay cho 1 thành viên uy tín — không cần bầu.
              </p>
              <select
                value={directNomineeId}
                onChange={(e) => setDirectNomineeId(e.target.value)}
                disabled={otherMembers.length === 0 || blockedByPhase}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none"
              >
                {otherMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!directNomineeId || appointDirect.isPending || blockedByPhase}
                onClick={() => appointDirect.mutate(directNomineeId)}
                className="w-full rounded-full bg-primary px-4 py-2.5 font-extrabold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-50"
              >
                Chỉ định làm Trưởng nhóm ngay
              </button>
            </div>

            {/* TRƯỜNG HỢP B: MỞ POLL 24H */}
            <div className="space-y-3 rounded-xl border border-border bg-background p-4 text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Mở bình chọn 24h
              </div>
              <p className="text-[11px] text-muted-foreground">
                Toàn bộ thành viên bỏ phiếu; quá 24h không đủ &gt;50% phiếu YES → nhóm tự động bị
                huỷ.
              </p>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Lý do mở bình chọn..."
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={pollNomineeId}
                onChange={(e) => setPollNomineeId(e.target.value)}
                disabled={otherMembers.length === 0 || blockedByPhase}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none"
              >
                {otherMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={
                  !reason.trim() || !pollNomineeId || createPoll.isPending || blockedByPhase
                }
                onClick={() =>
                  createPoll.mutate({ reason: reason.trim(), nomineeId: pollNomineeId })
                }
                className="w-full rounded-full border border-primary text-primary px-4 py-2.5 font-extrabold transition hover:bg-primary/10 disabled:opacity-50"
              >
                Mở Poll bình chọn 24h
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Chưa có yêu cầu chuyển giao Leader nào đang diễn ra.
          </p>
        )
      ) : request.status === 'APPROVED' ? (
        <div className="space-y-2 rounded-xl border border-primary/30 bg-background p-5 text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-primary" />
          <h5 className="text-sm font-extrabold text-primary">
            Đã chuyển giao quyền Leader cho {nomineeName}!
          </h5>
          <p className="text-[11px] text-muted-foreground">
            {request.mode === 'DIRECT'
              ? 'Chỉ định trực tiếp bởi Leader cũ.'
              : 'Thông qua bình chọn 24h.'}
          </p>
        </div>
      ) : request.status === 'EXPIRED' ? (
        <div className="space-y-2 rounded-xl border border-destructive/30 bg-background p-5 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
          <h5 className="text-sm font-extrabold text-destructive">
            Poll đã hết hạn 24h — nhóm đã tự động bị huỷ theo BR-LEAD.
          </h5>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-secondary/40 bg-background p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-foreground">Lý do: {request.reason}</p>
              {request.deadline && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10.5px] font-black text-secondary-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeLeft(request.deadline)}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Đề xuất Leader mới: <strong className="text-foreground">{nomineeName}</strong>
            </p>
            <VoteProgressBar yesCount={yesCount} requiredCount={requiredCount} accent="primary" />
            <VoteRoster members={members} votes={request.votes} accent="primary" />
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

function DissolveSection({
  groupId,
  isLeader,
  members,
}: Omit<GroupSuccessionTabProps, 'tripStatus' | 'phase'>) {
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
          <div className="rounded-xl border border-destructive/30 bg-background p-4 space-y-2">
            <p className="font-bold text-foreground">Lý do: {request.reason}</p>
            <VoteProgressBar
              yesCount={yesCount}
              requiredCount={requiredCount}
              accent="destructive"
            />
            <VoteRoster members={members} votes={request.votes} accent="destructive" />
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
