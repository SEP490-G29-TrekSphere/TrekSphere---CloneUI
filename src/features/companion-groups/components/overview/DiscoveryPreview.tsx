import {
  CalendarDays,
  CheckCircle2,
  Copy,
  HeartPulse,
  MapPinned,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { groupRecommendations } from '../../data/groupMatchingMocks';
import type { GroupRecommendation } from '../../types/groupMatchingTypes';

interface DiscoveryPreviewProps {
  selectedMatchGroup: GroupRecommendation | null;
  setSelectedMatchGroup: (group: GroupRecommendation | null) => void;
  onOpenMatchDetails: (group: GroupRecommendation) => void;
  onOpenJoinWizard: () => void;
  onOpenLeaderVetting: () => void;
  onOpenCreateFromVendorTour?: () => void;
}

export function DiscoveryPreview({
  selectedMatchGroup,
  setSelectedMatchGroup,
  onOpenMatchDetails,
  onOpenJoinWizard,
  onOpenLeaderVetting,
  onOpenCreateFromVendorTour,
}: DiscoveryPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                Giai đoạn 1 & 2
              </span>
              <h3 className="text-base font-extrabold text-foreground">
                Khám phá & Gợi ý Nhóm Ghép Tối Ưu (Matching Engine)
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Thuật toán tự động đo độ khớp về <strong>Khung ngày tự do, Thể lực, Ngân sách</strong>{' '}
              và <strong>Phong cách đi</strong> để đưa ra danh sách tối ưu nhất.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCreateFromVendorTour && (
              <button
                type="button"
                onClick={onOpenCreateFromVendorTour}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 text-xs font-extrabold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition shadow-xs"
              >
                <Copy className="h-4 w-4" />
                <span>Tạo từ Tour Vendor (Clone Plan)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenLeaderVetting}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-extrabold text-foreground hover:bg-muted transition"
            >
              <Users className="h-4 w-4 text-primary" />
              Tạo nhóm mới (Leader)
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groupRecommendations.map((grp) => {
          const isSelected = selectedMatchGroup?.id === grp.id;
          return (
            <div
              key={grp.id}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition shadow-xs hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <div className="space-y-4">
                {/* Header & Match Score */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {grp.featured && (
                      <span className="mb-1 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Phù hợp nhất với bạn
                      </span>
                    )}
                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition line-clamp-1">
                      {grp.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenMatchDetails(grp)}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary hover:bg-primary hover:text-primary-foreground transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {grp.match}%
                  </button>
                </div>

                {/* Quick Meta */}
                <div className="space-y-2 text-xs text-muted-foreground border-y border-border py-3">
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{grp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>{grp.date}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Độ khó: {grp.difficulty}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" /> {grp.members}
                    </span>
                  </div>
                </div>

                {/* Match Reasons Bullet List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">
                    Lý do gợi ý:
                  </span>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {grp.reasons.map((reason) => (
                      <li key={reason} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 border-t border-border pt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={grp.leader.avatar}
                    alt={grp.leader.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="text-[11px]">
                    <span className="font-bold text-foreground block">{grp.leader.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      Trust: {grp.leader.trustScore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMatchGroup(grp);
                      onOpenMatchDetails(grp);
                    }}
                    className="rounded-full border border-border px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    Xem match
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMatchGroup(grp);
                      onOpenJoinWizard();
                    }}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
                  >
                    Ứng tuyển
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
