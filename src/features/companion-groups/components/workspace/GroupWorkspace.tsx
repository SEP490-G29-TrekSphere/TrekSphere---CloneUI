import {
  Award,
  CheckCircle2,
  FileText,
  Footprints,
  Layers,
  Package,
  Radio,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdvanceLifecyclePhase, useGroupLifecycle } from '../../hooks/useGroupLifecycle';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import type { GroupLifecyclePhase } from '../../services/groupWorkspaceService';
import { GroupBudgetWorkspace } from './GroupBudgetWorkspace';
import { GroupEquipmentWorkspace } from './GroupEquipmentWorkspace';
import { GroupItineraryWorkspaceTab } from './GroupItineraryWorkspaceTab';
import { GroupMembersWorkspace } from './GroupMembersWorkspace';
import { GroupSuccessionTab } from './GroupSuccessionTab';
import { GroupWorkspaceOverviewTab } from './GroupWorkspaceOverviewTab';

export type WorkspaceSubTab =
  | 'overview'
  | 'itinerary'
  | 'budget'
  | 'members'
  | 'equipment'
  | 'succession';

const TABS: { id: WorkspaceSubTab; label: string; icon: typeof Layers }[] = [
  { id: 'overview', label: 'Tổng quan', icon: Radio },
  { id: 'itinerary', label: 'Lộ trình', icon: Layers },
  { id: 'budget', label: 'Ngân sách', icon: Wallet },
  { id: 'members', label: 'Thành viên', icon: Users },
  { id: 'equipment', label: 'Đồ dùng', icon: Package },
  { id: 'succession', label: 'Quản trị nhóm', icon: UserPlus },
];

const PHASE_LABELS: Record<GroupLifecyclePhase, { label: string; icon: typeof FileText }> = {
  1: { label: 'Bản nháp', icon: FileText },
  2: { label: 'Đang chuẩn bị', icon: UserPlus },
  3: { label: 'Sẵn sàng khởi hành', icon: CheckCircle2 },
  4: { label: 'Đang đi (On-going)', icon: Footprints },
  5: { label: 'Đã hoàn tất', icon: Award },
};

interface GroupWorkspaceProps {
  groupId: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
  ownerId: string;
  /** Card duyệt yêu cầu tham gia (leader) — chèn vào đầu tab "Thành viên" cho đúng ngữ cảnh. */
  joinRequestsSlot?: ReactNode;
  /** Số yêu cầu tham gia đang chờ — hiện badge trên tab "Thành viên" để leader không bỏ sót. */
  pendingJoinRequestsCount?: number;
}

/**
 * "Workspace nhóm" cho thành viên/trưởng nhóm đã tham gia — tái hiện luồng/UI của
 * WorkspacePreview trong `/groups/overview` (story-flow review) nhưng nối dữ liệu thật qua
 * `groupWorkspaceService.ts`. Thay thế `GroupOverviewTabs` + `MembersCard` khi role là
 * leader/member trong `CompanionGroupDetailPage`.
 */
export function GroupWorkspace({
  groupId,
  isLeader,
  members,
  ownerId,
  joinRequestsSlot,
  pendingJoinRequestsCount = 0,
}: GroupWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceSubTab>('overview');
  const { data: lifecycle } = useGroupLifecycle(groupId);
  const advancePhase = useAdvanceLifecyclePhase(groupId);

  const phase = lifecycle?.phase ?? 2;
  const phaseInfo = PHASE_LABELS[phase];
  const PhaseIcon = phaseInfo.icon;

  return (
    <div className="space-y-6">
      {/* PHASE BANNER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <PhaseIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-foreground">{phaseInfo.label}</span>
            {phase === 4 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                <Radio className="h-3 w-3 animate-pulse" /> Đang di chuyển
              </span>
            )}
          </div>
        </div>

        {isLeader && (
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1">
            {([1, 2, 3, 4, 5] as GroupLifecyclePhase[]).map((p) => (
              <button
                key={p}
                type="button"
                disabled={advancePhase.isPending}
                onClick={() => advancePhase.mutate(p)}
                title={PHASE_LABELS[p].label}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition',
                  phase === p
                    ? 'bg-background text-primary shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                P{p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUB-NAV */}
      <div className="scrollbar-none flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          if (tab.id === 'succession' && !isLeader && members.length < 2) return null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'members' && pendingJoinRequestsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
                  {pendingJoinRequestsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <GroupWorkspaceOverviewTab groupId={groupId} phase={phase} isLeader={isLeader} />
      )}
      {activeTab === 'itinerary' && (
        <GroupItineraryWorkspaceTab groupId={groupId} isLeader={isLeader} />
      )}
      {activeTab === 'budget' && (
        <GroupBudgetWorkspace groupId={groupId} isLeader={isLeader} members={members} />
      )}
      {activeTab === 'members' && (
        <GroupMembersWorkspace
          groupId={groupId}
          isLeader={isLeader}
          tripStatus={lifecycle?.tripStatus ?? 'ONGOING'}
          topSlot={joinRequestsSlot}
        />
      )}
      {activeTab === 'equipment' && (
        <GroupEquipmentWorkspace groupId={groupId} isLeader={isLeader} members={members} />
      )}
      {activeTab === 'succession' && (
        <GroupSuccessionTab
          groupId={groupId}
          isLeader={isLeader}
          members={members}
          ownerId={ownerId}
        />
      )}
    </div>
  );
}
