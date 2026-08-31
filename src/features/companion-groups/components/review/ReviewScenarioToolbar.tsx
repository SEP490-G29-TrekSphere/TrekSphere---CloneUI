import {
  Activity,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  UserCheck,
  Wifi,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  ApplicationState,
  GroupLifecycleState,
  GroupMatchingReviewScenario,
  ReviewActor,
  ReviewLocationPermission,
  ReviewNetwork,
} from '../../types/groupMatchingTypes';

interface ReviewScenarioToolbarProps {
  scenario: GroupMatchingReviewScenario;
  presets: GroupMatchingReviewScenario[];
  onApplyPreset: (presetId: string) => void;
  onSetActor: (actor: ReviewActor) => void;
  onSetGroupState: (state: GroupLifecycleState) => void;
  onSetApplicationState: (state: ApplicationState) => void;
  onSetNetwork: (network: ReviewNetwork) => void;
  onSetLocationPermission: (perm: ReviewLocationPermission) => void;
  onReset: () => void;
}

const ACTOR_LABELS: Record<ReviewActor, string> = {
  GUEST: 'Khách (Guest / Outsider)',
  APPLICANT: 'Ứng viên (Applied)',
  WAITLISTED_APPLICANT: 'Ứng viên Chờ (Waitlisted)',
  MEMBER: 'Thành viên (Member)',
  TREASURER: 'Thủ quỹ (Treasurer)',
  CO_LEADER: 'Phó nhóm (Co-Leader)',
  LEADER: 'Trưởng nhóm (Leader)',
};

const GROUP_STATE_LABELS: Record<GroupLifecycleState, string> = {
  DRAFT: 'Bản nháp (Draft)',
  RECRUITING: 'Đang tuyển (Recruiting)',
  FULL: 'Đủ chỗ (Full)',
  READY: 'Sẵn sàng (Ready)',
  IN_PROGRESS: 'Đang đi (In Progress)',
  SETTLING: 'Quyết toán (Settling)',
  COMPLETED: 'Hoàn tất (Completed)',
  ARCHIVED: 'Lưu trữ (Archived)',
};

const APP_STATE_LABELS: Record<ApplicationState, string> = {
  APPLIED: 'Đã nộp đơn (Applied)',
  WAITLISTED: 'Danh sách chờ (Waitlisted)',
  SLOT_OFFERED: 'Có offer (Slot Offered)',
  ACCEPTED: 'Đã nhận (Accepted)',
  REJECTED: 'Từ chối (Rejected)',
  WITHDRAWN: 'Rút đơn (Withdrawn)',
  OFFER_DECLINED: 'Từ chối offer (Declined)',
  OFFER_EXPIRED: 'Offer hết hạn (Expired)',
};

const NETWORK_LABELS: Record<ReviewNetwork, { label: string; tone: string }> = {
  ONLINE: {
    label: 'Online (Có mạng)',
    tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  OFFLINE: {
    label: 'Offline (Mất mạng)',
    tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  UNSTABLE: {
    label: 'Unstable (Chập chờn)',
    tone: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  },
};

const LOCATION_PERM_LABELS: Record<ReviewLocationPermission, string> = {
  PROMPT: 'Hỏi trước khi lấy (Prompt)',
  GRANTED: 'Đã cấp quyền (Granted)',
  DENIED: 'Từ chối vị trí (Denied)',
  UNAVAILABLE: 'Không có GPS (Unavailable)',
};

export function ReviewScenarioToolbar({
  scenario,
  presets,
  onApplyPreset,
  onSetActor,
  onSetGroupState,
  onSetApplicationState,
  onSetNetwork,
  onSetLocationPermission,
  onReset,
}: ReviewScenarioToolbarProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 p-3 shadow-xs backdrop-blur-md transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Review Mode
          </span>
          {/* Quick Active Scenario Summary Pills */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold">
            <span className="rounded-md bg-background/80 px-2 py-0.5 border border-border text-foreground">
              {ACTOR_LABELS[scenario.actor].split(' (')[0]}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="rounded-md bg-background/80 px-2 py-0.5 border border-border text-emerald-700 dark:text-emerald-400">
              {GROUP_STATE_LABELS[scenario.groupState].split(' (')[0]}
            </span>
          </div>
        </div>

        {/* Preset Selector & Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto max-w-[240px] sm:max-w-none no-scrollbar py-0.5">
            {presets.map((preset) => {
              const isActive =
                preset.id === scenario.id ||
                (preset.actor === scenario.actor &&
                  preset.groupState === scenario.groupState &&
                  preset.activeView === scenario.activeView);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition border cursor-pointer',
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-background/80 text-foreground border-border hover:bg-muted'
                  )}
                  title={preset.description}
                >
                  {preset.name.split(' (')[0]}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-background/90 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
            title={isExpanded ? 'Thu gọn bộ lọc' : 'Mở rộng bộ lọc tùy chỉnh'}
          >
            <span>Tùy chỉnh</span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            title="Khôi phục mặc định"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Controls Grid */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Actor Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-amber-600" /> Vai trò (Actor)
            </label>
            <select
              value={scenario.actor}
              onChange={(e) => onSetActor(e.target.value as ReviewActor)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {Object.entries(ACTOR_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Group Lifecycle State */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-600" /> Trạng thái Nhóm
            </label>
            <select
              value={scenario.groupState}
              onChange={(e) => onSetGroupState(e.target.value as GroupLifecycleState)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {Object.entries(GROUP_STATE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Application State */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-blue-600" /> Trạng thái Đơn
            </label>
            <select
              value={scenario.applicationState || 'APPLIED'}
              onChange={(e) => onSetApplicationState(e.target.value as ApplicationState)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {Object.entries(APP_STATE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Network Mode */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
              <Wifi className="h-3 w-3 text-indigo-600" /> Kết nối Mạng
            </label>
            <select
              value={scenario.network}
              onChange={(e) => onSetNetwork(e.target.value as ReviewNetwork)}
              className={cn(
                'w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
                NETWORK_LABELS[scenario.network].tone
              )}
            >
              {Object.entries(NETWORK_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Location Permission */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-rose-600" /> Quyền GPS/Vị trí
            </label>
            <select
              value={scenario.locationPermission}
              onChange={(e) => onSetLocationPermission(e.target.value as ReviewLocationPermission)}
              className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            >
              {Object.entries(LOCATION_PERM_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
